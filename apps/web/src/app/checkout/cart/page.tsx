'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calcPrice, formatPrice, CURRENCIES, DURATIONS, UPI_ID, WISE_LINK } from '@primekeys/shared'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useCatalogue, type CatalogueProduct } from '@/hooks/useCatalogue'
import { createOrder } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, User, CreditCard } from 'lucide-react'
import { Input } from '@/components/ui/input'

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

  const [step, setStep]       = useState<1|2|3>(1)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })
  const [orders, setOrders]   = useState<{ id: string; product: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [utr, setUtr]         = useState('')

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
      for (const item of cartItems) {
        const total   = itemTotal(item.product.effectiveINR, item.product.customPrices, item.months, currencyCode)
        const rounded = roundPrice(total, currencyCode) // keep decimal for non-INR
        const resp    = await createOrder({
          name:     formData.name.trim(),
          email:    formData.email.trim(),
          phone:    formData.phone.trim(),
          product:  item.product.id,
          duration: item.months,
          total:    rounded,
          currency: currencyCode,
        })
        placed.push({ id: resp.orderId || '', product: item.product.name })
      }
      setOrders(placed)
      setStep(2)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to place order. Please try again.')
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

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 12, fontSize: 14, color: '#ff6060' }}>
            {error}
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
                    <Input
                      placeholder="WhatsApp number (e.g. +91 98765 43210)"
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <CreditCard size={15} color="#6e6e73" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6' }}>
                    {currencyCode === 'INR' ? 'UPI Payment' : 'International Transfer'}
                  </span>
                </div>

                {/* Amount pill */}
                <div style={{ padding: '14px 16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#6e6e73', marginBottom: 4 }}>Amount to pay</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.02em' }}>
                    {formatPrice(grandTotal, currencyCode)}
                  </p>
                </div>

                {currencyCode === 'INR' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <p style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>UPI ID</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.02em' }}>{UPI_ID}</p>
                      <p style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Send exact amount · note your order name</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#a1a1a6', marginBottom: 8 }}>Enter UTR / Reference Number after payment</p>
                      <Input
                        placeholder="12-digit UTR number (e.g. 123456789012)"
                        value={utr}
                        onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 20))}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <p style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Send via Wise / PayPal</p>
                      <p style={{ fontSize: 13, color: '#a1a1a6' }}>
                        Transfer <strong style={{ color: '#f5f5f7' }}>{formatPrice(grandTotal, currencyCode)}</strong> and click "I've Paid" below.
                      </p>
                    </div>
                    <a
                      href={WISE_LINK}
                      target="_blank" rel="noreferrer"
                      style={{ display: 'block', padding: '13px 20px', textAlign: 'center', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12, color: '#D4AF37', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                    >
                      Open Wise ↗
                    </a>
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
