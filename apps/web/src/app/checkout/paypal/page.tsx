'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, ArrowLeft, Check, MessageCircle } from 'lucide-react'

const CLIENT_ID  = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const IS_SANDBOX = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX === 'true'

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', SGD: 'S$', CHF: 'Fr', NZD: 'NZ$', PHP: '₱',
}

// ── PayPal buttons inner ──────────────────────────────────
function PayPalButtonsInner({ total, currency, description, onSuccess, onError }: {
  total: number; currency: string; description: string
  onSuccess: (id: string) => void; onError: () => void
}) {
  const [{ isResolved, isRejected }] = usePayPalScriptReducer()

  if (isRejected) return (
    <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer"
      className="paypal-wa-btn">
      <MessageCircle size={16} />
      Complete via WhatsApp
    </a>
  )

  if (!isResolved) return (
    <div className="paypal-loading">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
      </svg>
      <span>Loading PayPal...</span>
    </div>
  )

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 50 }}
      createOrder={(_d, a) => a.order.create({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: total.toFixed(2) }, description }],
      })}
      onApprove={async (d, a) => {
        try { const o = await a.order!.capture(); onSuccess(o.id ?? d.orderID) }
        catch (e) { console.error('[PayPal]', e); onError() }
      }}
      onError={(e) => { console.error('[PayPal]', e); onError() }}
    />
  )
}

// ── Main ─────────────────────────────────────────────────
function CheckoutContent() {
  const params      = useSearchParams()
  const router      = useRouter()
  const productName = params.get('name')     || 'Subscription'
  const months      = parseInt(params.get('months')   || '1')
  const total       = parseFloat(params.get('total')  || '0')
  const currency    = params.get('currency') || 'USD'
  const iconSrc     = params.get('icon')     || ''

  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError]     = useState(false)

  const sym = CURRENCY_SYMBOLS[currency] || currency + ' '
  const perMonth = (total / months).toFixed(2)
  const desc = `PRIMEKEYS — ${productName} (${months} month${months > 1 ? 's' : ''})`

  const handleSuccess = (orderId: string) => {
    setSuccess(orderId)
    const msg = encodeURIComponent(
      `Hi! PayPal payment done.\n\nProduct: ${productName}\nDuration: ${months} month${months > 1 ? 's' : ''}\nAmount: ${currency} ${total}\nOrder ID: ${orderId}\n\nPlease send my credentials.`
    )
    window.open(`https://wa.me/918111956481?text=${msg}`, '_blank')
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0 }
        body { background: #050505; font-family: -apple-system, 'Inter', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(20px) } to { opacity:1;transform:translateY(0) } }
        @keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }

        .co-wrap {
          min-height: 100svh;
          background: #050505;
          display: flex;
          align-items: stretch;
        }

        /* Left panel — order summary */
        .co-left {
          width: 420px;
          flex-shrink: 0;
          background: #0a0a0a;
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          animation: fadeUp 0.5s ease both;
        }

        /* Right panel — payment */
        .co-right {
          flex: 1;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          animation: fadeUp 0.5s 0.1s ease both;
        }

        .co-logo { display: flex; align-items: center; gap: 2px; margin-bottom: 48px; }
        .co-logo-prime { font-size: 20px; font-weight: 800; color: #D4AF37; letter-spacing: -0.03em; }
        .co-logo-keys  { font-size: 20px; font-weight: 800; color: #fff;    letter-spacing: -0.03em; }

        .co-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 20px;
        }

        .co-product-row {
          display: flex; align-items: center; gap: 16px;
          padding: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          margin-bottom: 32px;
        }
        .co-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .co-product-name { font-size: 17px; font-weight: 700; color: #f5f5f7; margin-bottom: 3px; }
        .co-product-sub  { font-size: 12px; color: rgba(255,255,255,0.3); }

        .co-line {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .co-line:last-child { border-bottom: none; }
        .co-line-label { font-size: 13px; color: rgba(255,255,255,0.4); }
        .co-line-value { font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 500; }
        .co-total-label { font-size: 15px; font-weight: 700; color: #f5f5f7; }
        .co-total-value { font-size: 22px; font-weight: 800; color: #D4AF37; letter-spacing: -0.03em; }

        .co-gold-bar {
          height: 1px;
          background: linear-gradient(90deg, rgba(212,175,55,0.35), rgba(212,175,55,0.08), transparent);
          margin: 28px 0;
        }

        .co-trust { display: flex; gap: 20px; margin-top: auto; padding-top: 32px; }
        .co-trust-item { display: flex; align-items: center; gap: 7px; font-size: 11px; color: rgba(255,255,255,0.2); }

        /* Right side */
        .co-right-title { font-size: 22px; font-weight: 800; color: #f5f5f7; letter-spacing: -0.03em; margin-bottom: 6px; }
        .co-right-sub    { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 32px; }

        .co-sandbox {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 6px;
          background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25);
          color: #fbbf24; margin-bottom: 28px;
        }

        .co-error {
          padding: 12px 16px; border-radius: 12px;
          background: rgba(248,113,113,0.07); border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; font-size: 13px; margin-bottom: 20px; line-height: 1.5;
        }

        .paypal-loading {
          height: 50px; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          color: #444; font-size: 13px;
        }
        .paypal-loading svg { animation: spin 1s linear infinite; }

        .paypal-wa-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          height: 50px; border-radius: 12px; text-decoration: none;
          background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.2);
          color: #25D366; font-size: 14px; font-weight: 600;
          transition: background 0.2s;
        }
        .paypal-wa-btn:hover { background: rgba(37,211,102,0.14); }

        .co-back {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 28px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.2); font-size: 12px;
          transition: color 0.15s;
        }
        .co-back:hover { color: rgba(255,255,255,0.45); }

        /* Success */
        .co-success {
          padding: 40px; border-radius: 24px; text-align: center;
          background: rgba(74,222,128,0.04);
          border: 1px solid rgba(74,222,128,0.15);
        }
        .co-success-icon {
          width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px;
          background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.25);
          display: flex; align-items: center; justify-content: center;
        }
        .co-success h2 { font-size: 24px; font-weight: 800; color: #f5f5f7; margin-bottom: 10px; }
        .co-success p  { font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.7; }
        .co-success-id { font-family: monospace; color: #D4AF37; font-size: 12px; margin: 8px 0 20px; }

        .co-btn-back {
          display: inline-block; padding: 12px 28px; border-radius: 12px; text-decoration: none;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.2s;
        }
        .co-btn-back:hover { background: rgba(255,255,255,0.08); }

        /* Mobile */
        @media (max-width: 720px) {
          .co-wrap { flex-direction: column; }
          .co-left { width: 100%; padding: 32px 24px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .co-right { padding: 32px 24px; }
          .co-logo { margin-bottom: 28px; }
          .co-trust { flex-wrap: wrap; gap: 14px; }
        }
      `}</style>

      <div className="co-wrap">

        {/* ── LEFT — Order summary ── */}
        <div className="co-left">
          <div className="co-logo">
            <span className="co-logo-prime">PRIME</span>
            <span className="co-logo-keys">KEYS</span>
          </div>

          <p className="co-label">Order Summary</p>

          {/* Product */}
          <div className="co-product-row">
            <div className="co-icon">
              {iconSrc
                ? <img src={decodeURIComponent(iconSrc)} alt={productName} width={30} height={30} style={{ objectFit: 'contain' }} />
                : <span style={{ fontSize: 20 }}>🔑</span>
              }
            </div>
            <div>
              <p className="co-product-name">{productName}</p>
              <p className="co-product-sub">Premium Subscription</p>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="co-line">
              <span className="co-line-label">Monthly price</span>
              <span className="co-line-value">{sym}{perMonth}/mo</span>
            </div>
            <div className="co-line">
              <span className="co-line-label">Duration</span>
              <span className="co-line-value">{months} month{months > 1 ? 's' : ''}</span>
            </div>
            <div className="co-line">
              <span className="co-line-label">Delivery</span>
              <span style={{ fontSize: 12, color: '#25D366', fontWeight: 600 }}>WhatsApp · &lt;5 mins</span>
            </div>
          </div>

          <div className="co-gold-bar" />

          <div className="co-line">
            <span className="co-total-label">Total</span>
            <span className="co-total-value">{sym}{total.toFixed(2)}</span>
          </div>

          {/* Trust */}
          <div className="co-trust">
            <div className="co-trust-item"><Lock size={11} /> SSL Encrypted</div>
            <div className="co-trust-item"><Shield size={11} /> Buyer Protection</div>
          </div>
        </div>

        {/* ── RIGHT — Payment ── */}
        <div className="co-right">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="co-success">
                <div className="co-success-icon">
                  <Check size={28} color="#4ade80" />
                </div>
                <h2>Payment Successful!</h2>
                <p className="co-success-id">#{success.slice(-12).toUpperCase()}</p>
                <p>We&apos;ve opened WhatsApp to notify your order.<br />Credentials delivered within 5 minutes.</p>
                <br />
                <button onClick={() => router.back()} className="co-btn-back">← Back to Store</button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="co-right-title">Complete your order</h1>
                <p className="co-right-sub">Pay securely via PayPal. Your subscription is delivered on WhatsApp instantly after.</p>

                {IS_SANDBOX && (
                  <div className="co-sandbox">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
                    Sandbox Mode
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="co-error">
                      Payment failed or was cancelled. Please try again, or contact us on WhatsApp.
                    </motion.div>
                  )}
                </AnimatePresence>

                <PayPalScriptProvider options={{ clientId: CLIENT_ID, currency, intent: 'capture' }}>
                  <PayPalButtonsInner
                    total={total} currency={currency} description={desc}
                    onSuccess={handleSuccess} onError={() => setError(true)}
                  />
                </PayPalScriptProvider>

                <button onClick={() => router.back()} className="co-back">
                  <ArrowLeft size={13} /> Go back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </>
  )
}

export default function PayPalCheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#050505', minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
        </svg>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
