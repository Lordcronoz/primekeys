'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PRODUCTS, calcPrice, formatPrice, UPI_ID, WISE_LINK } from '@primekeys/shared'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { useCatalogue } from '@/hooks/useCatalogue'
import { createOrder, verifyUPI } from '@/lib/api'
import Link from 'next/link'

async function validatePromo(code: string) {
  const res = await fetch('/api/validate-promo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  return res.json() as Promise<{ valid: boolean; discount: number }>
}
import { CreditCard, MapPin, Tag, User, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ProgressIndicator from '@/components/ui/progress-indicator'

// ─── Shared card shell ─────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 24,
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

function CardHeader({ title }: { title: string }) {
  return (
    <div style={{
      padding: '20px 24px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 16,
      marginBottom: 0,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.01em' }}>{title}</h3>
    </div>
  )
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: '#6e6e73' }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6', letterSpacing: '-0.01em' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 24px' }} />
}

// ProgressIndicator imported from components/ui/progress-indicator

// ─── Gold CTA ─────────────────────────────────────────────────────────────────
function GoldBtn({ children, type = 'button', loading = false, onClick }: {
  children: React.ReactNode; type?: 'button' | 'submit'; loading?: boolean; onClick?: () => void
}) {
  return (
    <button type={type} onClick={onClick} disabled={loading} style={{
      width: '100%', height: 52,
      background: loading ? 'rgba(212,175,55,0.35)' : 'linear-gradient(135deg,#D4AF37,#C49A20)',
      color: '#000', border: 'none', borderRadius: 14,
      fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'opacity 0.2s',
    }}>
      {loading
        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        : children}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currencyCode } = useCurrency()
  const { user } = useAuth()

  const productId = searchParams.get('product')
  const months = parseInt(searchParams.get('months') || '3')
  const catalogue = useCatalogue()
  const product = catalogue.find(p => p.id === productId) || PRODUCTS.find(p => p.id === productId)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })
  const [promo, setPromo] = useState('')
  const [promoValid, setPromoValid] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoLoading, setPromoLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [utr, setUtr] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!product) router.push('/store')
    if (user && !formData.email) setFormData(p => ({ ...p, email: user.email || '', name: user.displayName || '' }))
  }, [product, router, user, formData.email])

  if (!product) return null

  const pricing = calcPrice((product as any).effectiveINR || product.baseINR, months, currencyCode)

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const finalTotal = promoValid ? Math.round(pricing.total * (1 - promoDiscount / 100)) : pricing.total
      const resp = await createOrder({
        name: formData.name, email: formData.email, phone: formData.phone,
        product: product.id, duration: months, total: finalTotal, currency: currencyCode,
        referralCode: promoValid ? promo : '',
      })
      setOrder({ id: resp.orderId, email: formData.email }); setStep(2)
    } catch (err: any) { setError(err.message || 'Something went wrong.') }
    finally { setLoading(false) }
  }

  const handleApplyPromo = async () => {
    if (!promo.trim()) return
    setPromoLoading(true)
    try {
      const result = await validatePromo(promo.trim().toUpperCase())
      if (result.valid) {
        setPromoValid(true)
        setPromoDiscount(result.discount)
      } else {
        setPromoValid(false)
        setPromoDiscount(0)
        setError('Invalid referral code. Ask a friend who uses PRIMEKEYS for their code!')
        setTimeout(() => setError(''), 3000)
      }
    } catch { setError('Could not verify code — try again') }
    finally { setPromoLoading(false) }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currencyCode !== 'INR') { setStep(3); return }
    if (!utr || utr.length < 12) { setError('Enter a valid 12-digit UTR number'); return }
    setLoading(true); setError('')
    try { await verifyUPI({ orderId: order.id, utrNumber: utr }); setStep(3) }
    catch (err: any) { setError(err.message || 'Verification failed.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingTop: 52 }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px 100px' }}>

        {/* Breadcrumb */}
        <Link href="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back to Store
        </Link>

        <div style={{ marginBottom: 28 }}>
          <ProgressIndicator step={step} showButtons={false} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 12, fontSize: 14, color: '#ff6060' }}>
            {error}
          </div>
        )}

        {/* ── STEP 1: DETAILS ─────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleSubmitDetails} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <Card>
              <CardHeader title="Order Summary" />

              <Section icon={<MapPin size={16} />} label="Subscription">
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7' }}>{product.name}</p>
                <p style={{ fontSize: 13, color: '#6e6e73', marginTop: 2 }}>{months} month{months > 1 ? 's' : ''} plan</p>
              </Section>

              <Divider />

              <Section icon={<User size={16} />} label="Contact Details">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Input
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="WhatsApp number"
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
              </Section>

              <Divider />

              <Section icon={<Tag size={16} />} label="Referral Code">
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="Friend's referral code"
                    value={promo}
                    onChange={e => { setPromo(e.target.value.toUpperCase()); setPromoValid(false) }}
                    disabled={promoValid}
                    style={{ flex: 1 }}
                  />
                  {promoValid ? (
                    <div style={{ height: 44, padding: '0 14px', borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✓ {promoDiscount}% off
                    </div>
                  ) : (
                    <button type="button" onClick={handleApplyPromo} disabled={promoLoading || !promo.trim()} style={{
                      padding: '0 18px', height: 44, borderRadius: 10,
                      background: promoLoading ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.1)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      color: '#D4AF37', fontSize: 14, fontWeight: 600, cursor: promoLoading ? 'not-allowed' : 'pointer',
                      flexShrink: 0, whiteSpace: 'nowrap',
                    }}>
                      {promoLoading ? 'Checking…' : 'Apply'}
                    </button>
                  )}
                </div>
                {!promoValid && <p style={{ fontSize: 11, color: '#555', marginTop: 6 }}>Ask a friend who's a PRIMEKEYS member for their referral code.</p>}
              </Section>

              <Divider />

              {/* Order total */}
              <div style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6', marginBottom: 12 }}>Order Total</p>
                {(() => {
                  const finalTotal = promoValid ? Math.round(pricing.total * (1 - promoDiscount / 100)) : pricing.total
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 0', fontSize: 14 }}>
                      <span style={{ color: '#6e6e73' }}>{months}-month plan</span>
                      <span style={{ textAlign: 'right', color: promoValid ? '#555' : '#f5f5f7', fontWeight: 600, textDecoration: promoValid ? 'line-through' : 'none' }}>{formatPrice(pricing.total, currencyCode)}</span>
                      {promoValid && <>
                        <span style={{ color: '#4ade80' }}>Referral discount</span>
                        <span style={{ textAlign: 'right', color: '#4ade80', fontWeight: 600 }}>−{promoDiscount}%</span>
                      </>}
                      <span style={{ color: '#6e6e73' }}>Delivery</span>
                      <span style={{ textAlign: 'right', color: '#2dcc6e', fontWeight: 600 }}>Free</span>
                      <span style={{ color: '#6e6e73' }}>Taxes</span>
                      <span style={{ textAlign: 'right', color: '#f5f5f7', fontWeight: 600 }}>Included</span>
                      {promoValid && <>
                        <span style={{ color: '#D4AF37', fontWeight: 700, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>Total</span>
                        <span style={{ textAlign: 'right', color: '#D4AF37', fontWeight: 700, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>{formatPrice(finalTotal, currencyCode)}</span>
                      </>}
                    </div>
                  )
                })()}
              </div>
            </Card>

            {/* Sticky footer total + CTA */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: '#6e6e73', marginBottom: 2 }}>Total today</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.02em' }}>
                  {formatPrice(promoValid ? Math.round(pricing.total * (1 - promoDiscount / 100)) : pricing.total, currencyCode)}
                </p>
              </div>
              <button type="submit" disabled={loading} style={{
                height: 48, padding: '0 28px',
                background: 'linear-gradient(135deg,#D4AF37,#C49A20)',
                color: '#000', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}>
                {loading
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : <>Place Order <ChevronRight size={16} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: PAYMENT ─────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <CardHeader title="Complete Payment" />

              <Section icon={<CreditCard size={16} />} label={currencyCode === 'INR' ? 'UPI Payment' : 'Wise Transfer'}>
                {currencyCode === 'INR' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      background: '#fff', borderRadius: 16, padding: 16,
                      width: 160, height: 160, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', textAlign: 'center',
                    }}>
                      <div style={{ color: '#111', fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                        <p style={{ fontSize: 28 }}>QR</p>
                        <p style={{ fontSize: 11 }}>{UPI_ID}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: '#a1a1a6', textAlign: 'center' }}>
                      Pay <strong style={{ color: '#f5f5f7' }}>{formatPrice(promoValid ? Math.round(pricing.total * (1 - promoDiscount / 100)) : pricing.total, currencyCode)}</strong> to{' '}
                      <span style={{ color: '#D4AF37', fontWeight: 600 }}>{UPI_ID}</span>
                    </p>
                    <div style={{ width: '100%' }}>
                      <Input
                        placeholder="Enter 12-digit UTR / Reference No."
                        value={utr}
                        onChange={e => setUtr(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: '#a1a1a6' }}>
                      Send <strong style={{ color: '#f5f5f7' }}>{formatPrice(promoValid ? Math.round(pricing.total * (1 - promoDiscount / 100)) : pricing.total, currencyCode)}</strong> via Wise. Once done, click the button below.
                    </p>
                    <a href={WISE_LINK} target="_blank" rel="noreferrer" style={{
                      display: 'block', padding: '12px 24px',
                      background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: 12, color: '#D4AF37', fontWeight: 700, fontSize: 15, textDecoration: 'none',
                    }}>
                      Open Wise ↗
                    </a>
                  </div>
                )}
              </Section>
            </Card>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <button type="button" onClick={() => setStep(1)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#555', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14,
              }}>
                <ArrowLeft size={14} /> Back
              </button>
              <div style={{ flex: 1 }} />
              <button type="submit" disabled={loading} style={{
                height: 48, padding: '0 28px',
                background: 'linear-gradient(135deg,#D4AF37,#C49A20)',
                color: '#000', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {loading
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : currencyCode === 'INR' ? <>Verify →</> : <>I've Paid →</>}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: SUCCESS ─────────────────────────────── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(212,175,55,0.1)',
                  border: '2px solid rgba(212,175,55,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 32px rgba(212,175,55,0.1)',
                }}>
                  <CheckCircle2 size={36} color="#D4AF37" />
                </div>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 8 }}>Order Confirmed!</h2>
                  <p style={{ fontSize: 14, color: '#6e6e73' }}>
                    Credentials heading to your WhatsApp at{' '}
                    <strong style={{ color: '#f5f5f7' }}>{formData.phone}</strong> in ~5 mins.
                  </p>
                </div>

                <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Order ID', val: order?.id ? `#${order.id.slice(-8).toUpperCase()}` : 'ORD-0001', mono: true },
                    { label: 'Product', val: product.name },
                    { label: 'Status', val: 'Pending Delivery', gold: true },
                  ].map(({ label, val, mono, gold }: any) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: '#6e6e73' }}>{label}</span>
                      <span style={{ color: gold ? '#D4AF37' : '#f5f5f7', fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18, padding: '16px 20px',
              display: 'flex', gap: 10,
            }}>
              <button onClick={() => router.push(`/portal/track/${order?.id}`)} style={{
                flex: 1, height: 48,
                background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
                color: '#D4AF37', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                Track Order
              </button>
              <button onClick={() => router.push('/store')} style={{
                flex: 1, height: 48,
                background: 'linear-gradient(135deg,#D4AF37,#C49A20)',
                color: '#000', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
      <CheckoutContent />
    </Suspense>
  )
}
