'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Shield, Lock, ArrowLeft, Check } from 'lucide-react'

// ── PayPal config ─────────────────────────────────────────
const CLIENT_ID  = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const IS_SANDBOX = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX === 'true'

// ── Inner buttons with SDK state detection ────────────────
function PayPalButtonsInner({
  total,
  currency,
  description,
  onSuccess,
  onError,
}: {
  total: number
  currency: string
  description: string
  onSuccess: (orderId: string) => void
  onError: () => void
}) {
  const [{ isResolved, isRejected }] = usePayPalScriptReducer()

  if (isRejected) return (
    <div style={{ padding: '20px', textAlign: 'center', borderRadius: 12, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }}>
      <p style={{ color: '#f87171', fontSize: 14, marginBottom: 12 }}>PayPal failed to load. Please try again or contact us.</p>
      <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer"
        style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 8, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
        Chat on WhatsApp
      </a>
    </div>
  )

  if (!isResolved) return (
    <div style={{ height: 50, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span style={{ fontSize: 13, color: '#555' }}>Loading PayPal...</span>
    </div>
  )

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 50 }}
      createOrder={(_data, actions) =>
        actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{ amount: { currency_code: currency, value: total.toFixed(2) }, description }],
        })
      }
      onApprove={async (data, actions) => {
        try {
          const order = await actions.order!.capture()
          onSuccess(order.id ?? data.orderID)
        } catch (err) {
          console.error('[PayPal] capture failed:', err)
          onError()
        }
      }}
      onError={(err) => { console.error('[PayPal] error:', err); onError() }}
    />
  )
}

// ── Main checkout UI ──────────────────────────────────────
function PayPalCheckoutContent() {
  const params    = useSearchParams()
  const router    = useRouter()

  const productId   = params.get('product') || ''
  const productName = params.get('name')    || 'Subscription'
  const months      = parseInt(params.get('months') || '1')
  const total       = parseFloat(params.get('total') || '0')
  const currency    = params.get('currency') || 'USD'
  const phone       = params.get('phone')   || ''
  const iconSrc     = params.get('icon')    || ''

  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError]     = useState(false)

  const description = `PRIMEKEYS — ${productName} (${months} month${months > 1 ? 's' : ''})`

  const handleSuccess = (orderId: string) => {
    setSuccess(orderId)
    // WhatsApp notification
    const msg = encodeURIComponent(
      `Hi! I just completed a PayPal payment.\n\n` +
      `*Product:* ${productName}\n` +
      `*Duration:* ${months} month${months > 1 ? 's' : ''}\n` +
      `*Amount:* ${currency} ${total}\n` +
      `*PayPal Order ID:* ${orderId}\n\n` +
      `Please confirm and send my credentials.`
    )
    window.open(`https://wa.me/918111956481?text=${msg}`, '_blank')
  }

  const currencySymbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', SGD: 'S$', CHF: 'Fr', NZD: 'NZ$',
  }
  const symbol = currencySymbols[currency] || currency + ' '

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        body { background: #000; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeUp 0.4s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#D4AF37' }}>PRIME</span>
            <span style={{ color: '#fff' }}>KEYS</span>
          </span>
          {IS_SANDBOX && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
              Sandbox
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            // ── Success screen ──
            <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{
              background: 'rgba(74,222,128,0.05)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 20, padding: 40, textAlign: 'center',
            }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={26} color="#4ade80" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f0', marginBottom: 8 }}>Payment Successful!</h2>
              <p style={{ fontSize: 14, color: '#6e6e73', marginBottom: 6 }}>
                Order ID: <span style={{ fontFamily: 'monospace', color: '#D4AF37' }}>{success.slice(0, 18)}...</span>
              </p>
              <p style={{ fontSize: 13, color: '#6e6e73', lineHeight: 1.7, marginBottom: 28 }}>
                We&apos;ve opened WhatsApp so we can send your credentials within 5 minutes. Keep it open!
              </p>
              <Link href="/store" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f0', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Back to Store
              </Link>
            </motion.div>
          ) : (
            // ── Checkout form ──
            <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Order summary card */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>

                {/* Gold accent bar */}
                <div style={{ height: 3, background: 'linear-gradient(90deg, #D4AF37, #C49A20, transparent)' }} />

                <div style={{ padding: '24px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 16 }}>
                    Order Summary
                  </p>

                  {/* Product row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {iconSrc && (
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={decodeURIComponent(iconSrc)} alt={productName} width={26} height={26} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 2 }}>{productName}</p>
                      <p style={{ fontSize: 12, color: '#555' }}>
                        {months} month{months > 1 ? 's' : ''} subscription
                      </p>
                    </div>
                  </div>

                  {/* Line items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#6e6e73' }}>Subscription</span>
                      <span style={{ fontSize: 13, color: '#f0f0f0' }}>{symbol}{(total / months).toFixed(2)}/mo</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#6e6e73' }}>Duration</span>
                      <span style={{ fontSize: 13, color: '#f0f0f0' }}>{months} month{months > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>Total</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#D4AF37' }}>{symbol}{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                    Payment failed. Please try again or contact us on WhatsApp.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PayPal buttons */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', textAlign: 'center', marginBottom: 16 }}>
                  Pay securely with
                </p>
                <PayPalScriptProvider options={{
                  clientId: CLIENT_ID,
                  currency,
                  intent: 'capture',
                }}>
                  <PayPalButtonsInner
                    total={total}
                    currency={currency}
                    description={description}
                    onSuccess={handleSuccess}
                    onError={() => setError(true)}
                  />
                </PayPalScriptProvider>
              </div>

              {/* Trust badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={11} color="#444" />
                  <span style={{ fontSize: 11, color: '#444' }}>SSL Encrypted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={11} color="#444" />
                  <span style={{ fontSize: 11, color: '#444' }}>Buyer Protection</span>
                </div>
              </div>

              {/* Back link */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button onClick={() => router.back()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
                  <ArrowLeft size={13} /> Go back
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ── Suspense wrapper (required for useSearchParams) ───────
export default function PayPalCheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    }>
      <PayPalCheckoutContent />
    </Suspense>
  )
}
