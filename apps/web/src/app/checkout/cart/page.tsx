'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calcPrice, formatPrice, CURRENCIES, DURATIONS, UPI_ID, WISE_LINK } from '@primekeys/shared'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useCatalogue, type CatalogueProduct } from '@/hooks/useCatalogue'
import { createOrderClient, notifyOrderAsync } from '@/lib/orderClient'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, User, CreditCard } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/PhoneInput'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

// ── PayPal button inner (handles loading / error states) ───
function PayPalInner({ total, currency, description, onSuccess, onError }: {
  total: number; currency: string; description: string
  onSuccess: (id: string) => void; onError: () => void
}) {
  const [{ isResolved, isRejected }] = usePayPalScriptReducer()
  if (isRejected) return (
    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.2)', fontSize: 13, color: '#aaa' }}>
      PayPal failed to load. Please refresh or use Wise below.
    </div>
  )
  if (!isResolved) return (
    <div style={{ height: 48, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13, gap: 8 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg>
      Loading PayPal…
    </div>
  )
  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 }}
      createOrder={(_d, a) => a.order.create({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: total.toFixed(2) }, description }],
      })}
      onApprove={async (d, a) => {
        try { const o = await a.order!.capture(); onSuccess(o.id ?? d.orderID) }
        catch (e) { console.error('[PayPal]', e); onError() }
      }}
      onError={e => { console.error('[PayPal]', e); onError() }}
    />
  )
}

// ── helpers ────────────────────────────────────────────────
function roundPrice(n: number, currency: string) {
  return currency === 'INR' ? Math.round(n) : parseFloat(n.toFixed(2))
}

function itemTotal(
  effectiveINR: number,
  customPrices: Record<string, number> | undefined,
  months: number,
  currencyCode: string,
): number {
  const customMonthly = customPrices?.[currencyCode]
  if (customMonthly !== undefined) {
    const dur = DURATIONS.find(d => d.months === months) || DURATIONS[0]
    return parseFloat((customMonthly * (dur.mult / months) * months).toFixed(2))
  }
  return calcPrice(effectiveINR, months, currencyCode).total
}

// ── sub-components ─────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 24, overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
  )
}

function CardHeader({ title }: { title: string }) {
  return (
    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7' }}>{title}</h3>
    </div>
  )
}

function Spin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

// ── main ───────────────────────────────────────────────────
function CartCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currencyCode } = useCurrency()
  const { user } = useAuth()
  const { clearCart } = useCart()
  const catalogue = useCatalogue()

  // Rebuild cart items from URL params (set by CartDrawer checkout link)
  const count = parseInt(searchParams.get('count') || '0')
  type CartEntry = { product: CatalogueProduct; months: number }
  const cartItems: CartEntry[] = []
  for (let i = 0; i < count; i++) {
    const productId = searchParams.get(`p${i}`)
    const months    = parseInt(searchParams.get(`m${i}`) || '1')
    const product   = catalogue.find(p => p.id === productId)
    if (product) cartItems.push({ product, months })
  }

  const [step, setStep]        = useState<1|2|3>(1)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })
  const [orders, setOrders]    = useState<{ id: string; product: string }[]>([])
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const [utr, setUtr]          = useState('')
  const [failedItems, setFailedItems] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      setFormData(p => ({
        ...p,
        email: user.email || '',
        name:  user.displayName || '',
      }))
    }
  }, [user])

  // ── loading skeleton while catalogue loads ─────────────
  if (catalogue.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (count === 0 || cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#555', fontSize: 15 }}>Your bag is empty.</p>
        <Link href="/store" style={{ color: '#D4AF37', textDecoration: 'none' }}>← Back to Store</Link>
      </div>
    )
  }

  const grandTotal = cartItems.reduce(
    (acc, item) => acc + itemTotal(item.product.effectiveINR, item.product.customPrices, item.months, currencyCode),
    0,
  )

  // ── Step 1 — Place all orders ──────────────────────────
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in all contact details.'); return
    }
    setLoading(true); setError('')
    try {
      const placed: { id: string; product: string }[] = []
      const failed: string[] = []
      for (const item of cartItems) {
        const total   = itemTotal(item.product.effectiveINR, item.product.customPrices, item.months, currencyCode)
        const rounded = roundPrice(total, currencyCode)
        const payload = {
          name:     formData.name.trim(),
          email:    formData.email.trim(),
          phone:    formData.phone.trim(),
          product:  item.product.id,
          duration: item.months,
          total:    rounded,
          currency: currencyCode,
        }
        try {
          // Write directly to Firestore via client SDK (no Admin SDK needed)
          const orderId = await createOrderClient(payload)
          placed.push({ id: orderId, product: item.product.name })
          // Fire-and-forget emails
          notifyOrderAsync(orderId, payload)
        } catch (itemErr: any) {
          console.error('Item order failed:', item.product.id, itemErr)
          failed.push(item.product.name)
        }
      }
      if (placed.length > 0) {
        setOrders(placed)
        if (failed.length > 0) {
          setError(`${failed.join(', ')} could not be processed — please contact us on WhatsApp.`)
        }
        setStep(2)
      } else {
        setError('Could not save your order. Please try again or contact us.')
        setFailedItems(cartItems.map(i => i.product.name))
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Something went wrong. Please try again.')
      setFailedItems(cartItems.map(i => i.product.name))
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2 — Payment confirmation ─────────────────────
  const handlePaymentDone = (e: React.FormEvent) => {
    e.preventDefault()
    if (currencyCode === 'INR' && utr.replace(/\D/g, '').length < 6) {
      setError('Please enter a valid UTR / reference number.'); return
    }
    setError('')
    clearCart()
    setStep(3)
  }

  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingTop: 52 }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px 100px' }}>

        {/* Back */}
        <Link href="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back to Store
        </Link>

        {/* Step indicator */}
        <div style={{ marginBottom: 28, display: 'flex', gap: 8, alignItems: 'center' }}>
          {([{ n: 1, label: 'Details' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Done' }] as const).map(({ n, label }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= n ? 'linear-gradient(135deg,#D4AF37,#C49A20)' : 'rgba(255,255,255,0.05)',
                border:     step >= n ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color:      step >= n ? '#000' : '#555',
              }}>{n}</div>
              <span style={{ fontSize: 12, color: step >= n ? '#D4AF37' : '#444' }}>{label}</span>
              {n < 3 && <div style={{ width: 32, height: 1, background: step > n ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)' }} />}
            </div>
          ))}
        </div>

        {/* Error + WhatsApp fallback */}
        {error && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ padding: '12px 16px', background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 12, fontSize: 13, color: '#ff6060', marginBottom: failedItems.length > 0 ? 10 : 0 }}>
              {error}
            </div>
            {failedItems.length > 0 && (
              <a
                href={`https://wa.me/918111956481?text=${encodeURIComponent(
                  `Hi! I'd like to order:\n${cartItems.map(i => `• ${i.product.name} (${i.months} month${i.months > 1 ? 's' : ''})`).join('\n')}\n\nTotal: ${formatPrice(grandTotal, currencyCode)}\nCurrency: ${currencyCode}\nName: ${formData.name}`
                )}`}
                target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 12,
                  background: 'rgba(37,211,102,0.08)',
                  border: '1px solid rgba(37,211,102,0.3)',
                  color: '#25D366', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.133 1.532 5.864L.057 23.57a.5.5 0 0 0 .614.612l5.807-1.461A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                Complete Order on WhatsApp
              </a>
            )}
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <CardHeader title="Order Summary" />
              <div style={{ padding: '16px 24px' }}>
                {cartItems.map((item, idx) => {
                  const t = itemTotal(item.product.effectiveINR, item.product.customPrices, item.months, currencyCode)
                  return (
                    <div key={item.product.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingBottom: 10, marginBottom: 10,
                      borderBottom: idx < cartItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f7' }}>{item.product.name}</p>
                        <p style={{ fontSize: 12, color: '#555' }}>{item.months} month{item.months > 1 ? 's' : ''}</p>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#D4AF37' }}>
                        {formatPrice(t, currencyCode)}
                      </p>
                    </div>
                  )
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f7' }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.02em' }}>
                    {formatPrice(grandTotal, currencyCode)}
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div style={{ padding: '0 24px 20px' }}>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <User size={14} color="#6e6e73" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6' }}>Contact Details</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <PhoneInput
                      value={formData.phone}
                      onChange={phone => setFormData(p => ({ ...p, phone }))}
                      placeholder="WhatsApp number"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Total + CTA */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: '#6e6e73', marginBottom: 2 }}>Total today</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.02em' }}>
                  {formatPrice(grandTotal, currencyCode)}
                </p>
                <p style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
                  {cartItems.length} subscription{cartItems.length > 1 ? 's' : ''} · WhatsApp delivery
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 50, padding: '0 28px',
                  background: loading ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg,#D4AF37,#C49A20)',
                  color: '#000', border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0,
                }}
              >
                {loading ? <Spin /> : 'Place Order →'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2 — Payment ── */}
        {step === 2 && (
          <form onSubmit={handlePaymentDone} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <CardHeader title="Complete Payment" />
              <div style={{ padding: '20px 24px' }}>
                {/* Amount pill */}
                <div style={{ padding: '14px 16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#6e6e73', marginBottom: 4 }}>Amount to pay</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.02em' }}>
                    {formatPrice(grandTotal, currencyCode)}
                  </p>
                </div>

                {currencyCode === 'INR' ? (
                  /* ── UPI ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <p style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>UPI ID</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.02em' }}>{UPI_ID}</p>
                      <p style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Send exact amount · note your order name</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#a1a1a6', marginBottom: 8 }}>Enter UTR / Reference Number after payment</p>
                      <Input
                        placeholder="12-digit UTR number"
                        value={utr}
                        onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 20))}
                      />
                    </div>
                  </div>
                ) : (
                  /* ── PayPal + Wise for international ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* PayPal */}
                    {PAYPAL_CLIENT_ID ? (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>Pay with PayPal</p>
                        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: currencyCode, intent: 'capture' }}>
                          <PayPalInner
                            total={parseFloat(grandTotal.toFixed(2))}
                            currency={currencyCode}
                            description={`PRIMEKEYS — ${cartItems.length} subscription${cartItems.length > 1 ? 's' : ''}`}
                            onSuccess={async (paypalOrderId) => {
                              // Mark all orders as PayPal-paid in Firestore
                              await Promise.allSettled(
                                orders.map(o => o.id
                                  ? updateDoc(doc(db, 'orders', o.id), { paymentMethod: 'paypal', paypalOrderId, status: 'utr_submitted' })
                                  : Promise.resolve()
                                )
                              )
                              clearCart()
                              setStep(3)
                            }}
                            onError={() => setError('PayPal payment failed or was cancelled. Please try again or use Wise below.')}
                          />
                        </PayPalScriptProvider>
                      </div>
                    ) : null}

                    {/* Wise fallback */}
                    <div style={{ paddingTop: PAYPAL_CLIENT_ID ? 8 : 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>
                        {PAYPAL_CLIENT_ID ? 'Or send via Wise' : 'Send via Wise / Bank Transfer'}
                      </p>
                      <a
                        href={WISE_LINK}
                        target="_blank" rel="noreferrer"
                        style={{ display: 'block', padding: '13px 20px', textAlign: 'center', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12, color: '#D4AF37', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                      >
                        Open Wise ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => { setError(''); setStep(1) }}
                style={{ height: 48, padding: '0 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#555', fontSize: 14, cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                type="submit"
                style={{ flex: 1, height: 48, background: 'linear-gradient(135deg,#D4AF37,#C49A20)', border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >
                {currencyCode === 'INR' ? 'Verify & Confirm →' : "I've Paid →"}
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#333' }}>
              Questions?{' '}
              <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', textDecoration: 'none' }}>
                Chat on WhatsApp
              </a>
            </p>
          </form>
        )}

        {/* ── STEP 3 — Success ── */}
        {step === 3 && (
          <Card>
            <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(212,175,55,0.1)', border: '2px solid rgba(212,175,55,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(212,175,55,0.12)',
              }}>
                <CheckCircle2 size={36} color="#D4AF37" />
              </div>

              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  All Orders Placed! 🎉
                </h2>
                <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.6 }}>
                  Credentials for {orders.length} subscription{orders.length > 1 ? 's' : ''} will arrive on your WhatsApp in ~5 minutes.
                </p>
              </div>

              {/* Order IDs */}
              {orders.length > 0 && (
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                  {orders.map((o, i) => (
                    <div key={o.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', fontSize: 13,
                      borderBottom: i < orders.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      <span style={{ color: '#6e6e73' }}>{o.product}</span>
                      <span style={{ color: '#f5f5f7', fontFamily: 'monospace', fontSize: 11 }}>
                        #{o.id?.slice(-8)?.toUpperCase() || 'CONFIRMED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button
                  onClick={() => router.push('/portal')}
                  style={{ flex: 1, height: 46, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  My Account
                </button>
                <button
                  onClick={() => router.push('/store')}
                  style={{ flex: 1, height: 46, background: 'linear-gradient(135deg,#D4AF37,#C49A20)', border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Shop More
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function CartCheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <CartCheckoutContent />
    </Suspense>
  )
}
