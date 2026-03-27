'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, ArrowLeft, Check, MessageCircle } from 'lucide-react'
import { confirmPayPalOrder } from '@/lib/api'

const CLIENT_ID  = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const IS_SANDBOX = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX === 'true'

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', SGD: 'S$', CHF: 'Fr', NZD: 'NZ$', PHP: '₱',
}

function PayPalButtonsInner({ total, currency, description, onSuccess, onError }: {
  total: number; currency: string; description: string
  onSuccess: (id: string) => void; onError: () => void
}) {
  const [{ isResolved, isRejected }] = usePayPalScriptReducer()

  if (isRejected) return (
    <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      height: 50, borderRadius: 10, textDecoration: 'none',
      background: '#e8f9ee', border: '1px solid #a8e6bc',
      color: '#1a7840', fontSize: 14, fontWeight: 600,
    }}>
      <MessageCircle size={16} /> Complete via WhatsApp
    </a>
  )

  if (!isResolved) return (
    <div style={{
      height: 50, borderRadius: 10, background: '#f5f5f5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      color: '#999', fontSize: 13,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5"
        style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
      </svg>
      Loading PayPal...
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

function CheckoutContent() {
  const params      = useSearchParams()
  const router      = useRouter()
  const productName = params.get('name')     || 'Subscription'
  const months      = parseInt(params.get('months')   || '1')
  const total       = parseFloat(params.get('total')  || '0')
  const currency    = params.get('currency') || 'USD'
  const iconSrc     = params.get('icon')     || ''
  const custName    = params.get('custName') || ''
  const custEmail   = params.get('email')    || ''
  const custPhone   = params.get('phone')    || ''
  const productId   = params.get('productId')|| productName.toLowerCase()

  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError]     = useState(false)

  const sym      = CURRENCY_SYMBOLS[currency] || currency + ' '
  const perMonth = (total / months).toFixed(2)
  const desc     = `PRIMEKEYS — ${productName} (${months} month${months > 1 ? 's' : ''})`

  const handleSuccess = async (paypalOrderId: string) => {
    try {
      // 1. Create order in Firestore + send invoice email automatically
      await confirmPayPalOrder({
        paypalOrderId,
        name:     custName,
        email:    custEmail,
        phone:    custPhone,
        product:  productId,
        duration: months,
        total,
        currency,
      })
    } catch (e) {
      console.error('[PayPal confirm]', e)
      // Non-fatal — still show success and open WhatsApp
    }
    setSuccess(paypalOrderId)
    // 2. Also open WhatsApp as backup notification
    const msg = encodeURIComponent(
      `Hi! PayPal payment done.\n\nProduct: ${productName}\nDuration: ${months} month${months > 1 ? 's' : ''}\nAmount: ${currency} ${total}\nPayPal ID: ${paypalOrderId}\n\nPlease send my credentials.`
    )
    window.open(`https://wa.me/918111956481?text=${msg}`, '_blank')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111; font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0;transform:translateY(18px) } to { opacity:1;transform:translateY(0) } }

        .co-shell {
          min-height: 100svh;
          display: flex;
        }

        /* ── Dark left panel ── */
        .co-left {
          width: 400px; flex-shrink: 0;
          background: #0d0d0d;
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 48px 40px;
          display: flex; flex-direction: column;
          animation: fadeUp 0.45s ease both;
        }

        /* ── Light right panel ── */
        .co-right {
          flex: 1;
          background: #f7f7f8;
          padding: 48px 52px;
          display: flex; flex-direction: column; justify-content: center;
          animation: fadeUp 0.45s 0.08s ease both;
        }

        /* Logo */
        .co-logo { display: flex; align-items: center; margin-bottom: 52px; }
        .co-logo span:first-child { font-size: 19px; font-weight: 800; color: #D4AF37; letter-spacing: -0.03em; }
        .co-logo span:last-child  { font-size: 19px; font-weight: 800; color: #fff;    letter-spacing: -0.03em; }

        /* Left labels */
        .co-section-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.2); margin-bottom: 16px;
        }

        /* Product card */
        .co-product-card {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 16px;
          margin-bottom: 28px;
        }
        .co-product-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .co-product-name { font-size: 15px; font-weight: 700; color: #f2f2f2; margin-bottom: 2px; }
        .co-product-type { font-size: 11px; color: rgba(255,255,255,0.28); }

        /* Line items */
        .co-line {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .co-line:last-child { border: none; }
        .co-ll { font-size: 12px; color: rgba(255,255,255,0.35); }
        .co-lv { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500; }
        .co-delivery-val { font-size: 11px; color: #25D366; font-weight: 600; }

        /* Divider */
        .co-divider {
          height: 1px; margin: 20px 0;
          background: linear-gradient(90deg, rgba(212,175,55,0.4), rgba(212,175,55,0.08), transparent);
        }

        /* Total */
        .co-total-row { display: flex; justify-content: space-between; align-items: baseline; }
        .co-total-label { font-size: 14px; font-weight: 700; color: #f2f2f2; }
        .co-total-amt   { font-size: 26px; font-weight: 800; color: #D4AF37; letter-spacing: -0.04em; }

        /* Trust */
        .co-trust { display: flex; gap: 18px; margin-top: auto; padding-top: 36px; }
        .co-trust-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: rgba(255,255,255,0.18);
        }

        /* ── Right side ── */
        .co-right-title { font-size: 24px; font-weight: 800; color: #111; letter-spacing: -0.035em; margin-bottom: 6px; }
        .co-right-sub   { font-size: 13px; color: #888; margin-bottom: 28px; line-height: 1.5; }

        .co-sandbox-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 6px; margin-bottom: 24px;
          background: #fffbeb; border: 1px solid #fcd34d; color: #b45309;
        }

        .co-error-box {
          padding: 12px 16px; border-radius: 10px; margin-bottom: 18px;
          background: #fff1f1; border: 1px solid #fecaca;
          color: #dc2626; font-size: 13px; line-height: 1.5;
        }

        .co-method-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #aaa; margin-bottom: 14px;
        }

        .co-back-btn {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 24px;
          background: none; border: none; cursor: pointer;
          color: #bbb; font-size: 12px; font-family: inherit;
          transition: color 0.15s;
        }
        .co-back-btn:hover { color: #777; }

        /* ── Success ── */
        .co-success {
          text-align: center; padding: 48px 32px; border-radius: 20px;
          background: #fff; border: 1px solid #e5e7eb;
          box-shadow: 0 4px 32px rgba(0,0,0,0.08);
        }
        .co-success-icon {
          width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          display: flex; align-items: center; justify-content: center;
        }
        .co-success h2 { font-size: 22px; font-weight: 800; color: #111; margin-bottom: 6px; }
        .co-success-id { font-family: monospace; font-size: 12px; color: #D4AF37; margin: 6px 0 16px; }
        .co-success p  { font-size: 13px; color: #666; line-height: 1.7; margin-bottom: 28px; }
        .co-success-btn {
          display: inline-block; padding: 12px 28px; border-radius: 12px; cursor: pointer;
          background: #111; color: #fff; border: none; font-size: 14px;
          font-weight: 600; font-family: inherit; transition: opacity 0.15s;
        }
        .co-success-btn:hover { opacity: 0.8; }

        /* Mobile */
        @media (max-width: 720px) {
          .co-shell { flex-direction: column; }
          .co-left  { width: 100%; padding: 28px 24px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .co-right { padding: 32px 24px; }
          .co-logo  { margin-bottom: 28px; }
        }
      `}</style>

      <div className="co-shell">

        {/* ─── DARK LEFT ─── */}
        <div className="co-left">
          <div className="co-logo">
            <span>PRIME</span><span>KEYS</span>
          </div>

          <p className="co-section-label">Order Summary</p>

          <div className="co-product-card">
            <div className="co-product-icon">
              {iconSrc
                ? <img src={decodeURIComponent(iconSrc)} alt={productName} width={28} height={28} style={{ objectFit: 'contain' }} />
                : <span style={{ fontSize: 22 }}>🔑</span>
              }
            </div>
            <div>
              <p className="co-product-name">{productName}</p>
              <p className="co-product-type">Premium Subscription</p>
            </div>
          </div>

          <div>
            <div className="co-line">
              <span className="co-ll">Monthly price</span>
              <span className="co-lv">{sym}{perMonth}/mo</span>
            </div>
            <div className="co-line">
              <span className="co-ll">Duration</span>
              <span className="co-lv">{months} month{months > 1 ? 's' : ''}</span>
            </div>
            <div className="co-line">
              <span className="co-ll">Delivery</span>
              <span className="co-delivery-val">WhatsApp · &lt;5 min</span>
            </div>
          </div>

          <div className="co-divider" />

          <div className="co-total-row">
            <span className="co-total-label">Total due</span>
            <span className="co-total-amt">{sym}{total.toFixed(2)}</span>
          </div>

          <div className="co-trust">
            <div className="co-trust-item"><Lock size={11} />SSL Encrypted</div>
            <div className="co-trust-item"><Shield size={11} />Buyer Protection</div>
          </div>
        </div>

        {/* ─── LIGHT RIGHT ─── */}
        <div className="co-right">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="co-success">
                <div className="co-success-icon">
                  <Check size={28} color="#16a34a" />
                </div>
                <h2>Payment Successful!</h2>
                <p className="co-success-id">#{success.slice(-12).toUpperCase()}</p>
                <p>WhatsApp has been opened to notify your order.<br />Your credentials will be delivered within 5 minutes.</p>
                <button onClick={() => router.back()} className="co-success-btn">← Back to Store</button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="co-right-title">Complete your order</h1>
                <p className="co-right-sub">Pay securely via PayPal — your subscription is delivered to WhatsApp seconds after payment.</p>

                {IS_SANDBOX && (
                  <div className="co-sandbox-badge">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                    Sandbox Mode — no real charge
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="co-error-box">
                      Payment failed or was cancelled. Please try again.
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="co-method-label">Select payment method</p>

                <PayPalScriptProvider options={{ clientId: CLIENT_ID, currency, intent: 'capture' }}>
                  <PayPalButtonsInner
                    total={total} currency={currency} description={desc}
                    onSuccess={handleSuccess} onError={() => setError(true)}
                  />
                </PayPalScriptProvider>

                <button onClick={() => router.back()} className="co-back-btn">
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
      <div style={{ background: '#f7f7f8', minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
        </svg>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
