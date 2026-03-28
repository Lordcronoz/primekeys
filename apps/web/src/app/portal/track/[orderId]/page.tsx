'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertCircle, Key, ArrowLeft, Loader2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { PRODUCTS } from '@primekeys/shared'
import { formatPrice } from '@primekeys/shared'
import { motion } from 'framer-motion'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; desc: string }> = {
  pending:       { label: 'Awaiting Payment',  color: '#fbbf24', icon: Clock,       desc: 'Your order is waiting for payment confirmation.' },
  utr_submitted: { label: 'Verifying Payment', color: '#60a5fa', icon: Loader2,     desc: 'We received your UTR and are manually verifying it.' },
  activated:     { label: 'Delivered',          color: '#4ade80', icon: CheckCircle2, desc: 'Your credentials are on the way to your WhatsApp!' },
}

function OrderCard({ order }: { order: any }) {
  const router = useRouter()
  const p = PRODUCTS.find(pr => pr.id === order.product)
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const StatusIcon = status.icon

  const steps = [
    { key: 'pending',        label: 'Order Placed',  done: true },
    { key: 'utr_submitted',  label: 'Payment Verified', done: order.status !== 'pending' },
    { key: 'activated',      label: 'Credentials Sent', done: order.status === 'activated' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push('/store')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <span style={{ color: '#333', fontSize: 13 }}>·</span>
        <span style={{ color: '#555', fontSize: 13 }}>Order #{order.id?.slice(-8).toUpperCase()}</span>
      </div>

      {/* Status hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${status.color}33`,
          borderRadius: 20, padding: '28px 24px',
          marginBottom: 20, textAlign: 'center',
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `${status.color}18`,
          border: `1.5px solid ${status.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <StatusIcon size={24} style={{ color: status.color }} />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: status.color, marginBottom: 6 }}>{status.label}</p>
        <p style={{ fontSize: 13, color: '#6e6e73' }}>{status.desc}</p>
      </motion.div>

      {/* Progress steps */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
        {steps.map((step, i) => {
          const cfg = STATUS_CONFIG[step.key]
          const StepIcon = cfg.icon
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: i < steps.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: step.done ? `${cfg.color}20` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${step.done ? cfg.color : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {step.done ? (
                    <CheckCircle2 size={16} style={{ color: cfg.color }} />
                  ) : (
                    <StepIcon size={14} style={{ color: '#444' }} />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 1.5, height: 24, background: step.done ? cfg.color : 'rgba(255,255,255,0.08)', marginTop: 4 }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: step.done ? '#f5f5f7' : '#555' }}>{step.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order details */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Order Details</p>
        {[
          { label: 'Service', value: p?.name || order.product },
          { label: 'Duration', value: `${order.duration} month${order.duration > 1 ? 's' : ''}` },
          { label: 'Total Paid', value: formatPrice(order.total, order.currency) },
          { label: 'Payment', value: order.paymentMethod === 'paypal' ? 'PayPal' : order.currency === 'INR' ? 'UPI' : 'Wise' },
          { label: 'UTR', value: order.utrNumber || '—' },
          { label: 'Date', value: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
            <span style={{ fontSize: 12, color: '#a1a1a6', fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Help */}
      {order.status !== 'activated' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>Need help? Message us on WhatsApp.</p>
          <a
            href="https://wa.me/918111956481"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 980,
              background: '#25D366', color: '#000',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contact Support
          </a>
        </div>
      )}
    </div>
  )
}

export default function TrackOrderPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!orderId) return
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() })
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error(err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) }}`}</style>
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#444', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f5f5f7', marginBottom: 8 }}>Order not found</h2>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 24 }}>Check your order ID and try again, or contact WhatsApp support.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/store')} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1a6', cursor: 'pointer', fontSize: 13 }}>Back to Store</button>
          <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer" style={{ padding: '10px 20px', borderRadius: 10, background: '#25D366', color: '#000', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>WhatsApp Support</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 20px 100px' }}>
        <OrderCard order={order} />
      </div>
    </div>
  )
}
