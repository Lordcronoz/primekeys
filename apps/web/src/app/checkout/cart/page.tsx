'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calcPrice, formatPrice, CURRENCIES, UPI_ID, WISE_LINK } from '@primekeys/shared'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useCatalogue } from '@/hooks/useCatalogue'
import { createOrder } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, User, Tag, CreditCard } from 'lucide-react'
import { Input } from '@/components/ui/input'

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
function Divider() { return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 24px' }} /> }

function CartCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currencyCode } = useCurrency()
  const { user } = useAuth()
  const { clearCart } = useCart()
  const catalogue = useCatalogue()

  // Rebuild cart items from URL params
  const count = parseInt(searchParams.get('count') || '0')
  const cartItems = Array.from({ length: count }, (_, i) => {
    const productId = searchParams.get(`p${i}`)
    const months = parseInt(searchParams.get(`m${i}`) || '1')
    const product = catalogue.find(p => p.id === productId)
    return product ? { product, months } : null
  }).filter(Boolean) as { product: ReturnType<typeof catalogue[0]['valueOf']> & any; months: number }[]

  const [step, setStep] = useState<1|2|3>(1)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [utr, setUtr] = useState('')

  useEffect(() => {
    if (user) setFormData(p => ({ ...p, email: user.email || '', name: user.displayName || '' }))
  }, [user])

  if (cartItems.length === 0 && count > 0 && catalogue.length > 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#555', fontSize: 15 }}>Your bag is empty.</p>
        <Link href="/store" style={{ color: '#D4AF37', textDecoration: 'none' }}>← Back to Store</Link>
      </div>
    )
  }

  // Price per item
  function itemTotal(product: any, months: number) {
    const customMonthly = product.customPrices?.[currencyCode]
    if (customMonthly !== undefined) {
      const { DURATIONS } = require('@primekeys/shared')
      const dur = DURATIONS.find((d: any) => d.months === months) || DURATIONS[0]
      return parseFloat((customMonthly * (dur.mult / months) * months).toFixed(2))
    }
    return calcPrice(product.effectiveINR, months, currencyCode).total
  }

  const grandTotal = cartItems.reduce((acc, item) => acc + itemTotal(item.product, item.months), 0)

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const placed = []
      for (const item of cartItems) {
        const total = itemTotal(item.product, item.months)
        const resp = await createOrder({
          name: formData.name, email: formData.email, phone: formData.phone,
          product: item.product.id, duration: item.months,
          total: Math.round(total), currency: currencyCode,
        })
        placed.push({ id: resp.orderId, product: item.product.name })
      }
      setOrders(placed); setStep(2)
    } catch (err: any) { setError(err.message || 'Something went wrong.') }
    finally { setLoading(false) }
  }

  const handleVerifyOrSkip = (e: React.FormEvent) => {
    e.preventDefault()
    if (currencyCode === 'INR' && (!utr || utr.length < 12)) {
      setError('Enter a valid 12-digit UTR number'); return
    }
    clearCart()
    setStep(3)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingTop: 52 }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px 100px' }}>

        <Link href="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back to Store
        </Link>

        <div style={{ marginBottom: 28, display: 'flex', gap: 8, alignItems: 'center' }}>
          {[{ n: 1, label: 'Details' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Done' }].map(({ n, label }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= n ? 'linear-gradient(135deg,#D4AF37,#C49A20)' : 'rgba(255,255,255,0.05)',
                border: step >= n ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: step >= n ? '#000' : '#555',
              }}>{n}</div>
              <span style={{ fontSize: 12, color: step >= n ? '#D4AF37' : '#444' }}>{label}</span>
              {n < 3 && <div style={{ width: 32, height: 1, background: step > n ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)' }} />}
            </div>
          ))}
        </div>

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
                {cartItems.map(item => {
                  const t = itemTotal(item.product, item.months)
                  return (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f7' }}>{item.product.name}</p>
                        <p style={{ fontSize: 12, color: '#555' }}>{item.months} month{item.months > 1 ? 's' : ''}</p>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#D4AF37' }}>{formatPrice(Math.round(t), currencyCode)}</p>
                    </div>
                  )
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f7' }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#D4AF37' }}>{formatPrice(Math.round(grandTotal), currencyCode)}</span>
                </div>
              </div>
              <Divider />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <User size={15} color="#6e6e73" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6' }}>Contact Details</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                  <Input placeholder="WhatsApp number" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} required />
                  <Input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required />
                </div>
              </div>
            </Card>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: '#6e6e73', marginBottom: 2 }}>Total today</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.02em' }}>{formatPrice(Math.round(grandTotal), currencyCode)}</p>
              </div>
              <button type="submit" disabled={loading} style={{ height: 48, padding: '0 28px', background: 'linear-gradient(135deg,#D4AF37,#C49A20)', color: '#000', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {loading ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <>Place Order →</>}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOrSkip} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <CardHeader title="Complete Payment" />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <CreditCard size={15} color="#6e6e73" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6' }}>{currencyCode === 'INR' ? 'UPI Payment' : 'Wise Transfer'}</span>
                </div>
                {currencyCode === 'INR' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                    <p style={{ fontSize: 14, color: '#a1a1a6', textAlign: 'center' }}>
                      Pay <strong style={{ color: '#f5f5f7' }}>{formatPrice(Math.round(grandTotal), currencyCode)}</strong> to <span style={{ color: '#D4AF37', fontWeight: 600 }}>{UPI_ID}</span>
                    </p>
                    <Input placeholder="Enter 12-digit UTR / Reference No." value={utr} onChange={e => setUtr(e.target.value.replace(/[^0-9]/g, ''))} maxLength={12} required />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: '#a1a1a6', marginBottom: 14 }}>Send <strong style={{ color: '#f5f5f7' }}>{formatPrice(Math.round(grandTotal), currencyCode)}</strong> via Wise, then click below.</p>
                    <a href={WISE_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '12px 24px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12, color: '#D4AF37', fontWeight: 700, textDecoration: 'none' }}>Open Wise ↗</a>
                  </div>
                )}
              </div>
            </Card>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(1)} style={{ height: 48, padding: '0 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#555', fontSize: 14, cursor: 'pointer' }}>← Back</button>
              <button type="submit" style={{ flex: 1, height: 48, background: 'linear-gradient(135deg,#D4AF37,#C49A20)', border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {currencyCode === 'INR' ? 'Verify & Confirm →' : "I've Paid →"}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <Card>
            <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(212,175,55,0.1)' }}>
                <CheckCircle2 size={36} color="#D4AF37" />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 8 }}>All Orders Confirmed!</h2>
                <p style={{ fontSize: 14, color: '#6e6e73' }}>Credentials for all {orders.length} subscription{orders.length > 1 ? 's' : ''} will be sent to your WhatsApp in ~5 mins.</p>
              </div>
              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                {orders.map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#6e6e73' }}>{o.product}</span>
                    <span style={{ color: '#f5f5f7', fontFamily: 'monospace' }}>#{o.id?.slice(-8).toUpperCase() || 'CONFIRMED'}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button onClick={() => router.push('/portal')} style={{ flex: 1, height: 46, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>My Account</button>
                <button onClick={() => router.push('/store')} style={{ flex: 1, height: 46, background: 'linear-gradient(135deg,#D4AF37,#C49A20)', border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Shop More</button>
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
      <CartCheckoutContent />
    </Suspense>
  )
}
