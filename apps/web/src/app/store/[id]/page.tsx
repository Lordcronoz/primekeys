'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DURATIONS, CURRENCIES, TEAM_ROLES } from '@primekeys/shared'
import { useCatalogue } from '@/hooks/useCatalogue'
import { useCurrency } from '@/context/CurrencyContext'
import Link from 'next/link'
import { ArrowLeft, Check, MessageCircle, Shield, Zap, Clock } from 'lucide-react'

const svgDataUri = (s: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`

const BRAND_ICONS: Record<string, string> = {
  netflix:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E50914" d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 24c-.538.086-2.953.408-4.32.6L9.386 13.098v10.821L5.398 24V0z"/></svg>`),
  spotify:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1DB954" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`),
  youtube:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`),
  chatgpt:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369L15.114 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.098-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>`),
  disney:   svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#113CCF" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.188 5.52c.738 0 1.29.204 1.656.612.366.408.549.936.549 1.584s-.183 1.176-.549 1.584c-.366.408-.918.612-1.656.612-.744 0-1.302-.204-1.674-.612-.372-.408-.558-.936-.558-1.584s.186-1.176.558-1.584c.372-.408.93-.612 1.674-.612zm-3.744 8.52c.36.864.984 1.476 1.872 1.836.564.228 1.188.336 1.872.336.996 0 1.896-.276 2.7-.828.804-.552 1.356-1.32 1.656-2.304.144-.456.216-.924.216-1.404 0-.876-.228-1.668-.684-2.376-.456-.708-1.092-1.224-1.908-1.548.6.492 1.02 1.14 1.26 1.944.12.408.18.828.18 1.26 0 .564-.108 1.08-.324 1.548s-.528.864-.936 1.188c-.408.324-.888.54-1.44.648-.552.108-1.116.06-1.692-.144-.576-.204-1.068-.564-1.476-1.08-.408-.516-.648-1.116-.72-1.8-.072-.684.036-1.344.324-1.98a4.14 4.14 0 0 1 1.26-1.584c-.804.18-1.5.576-2.088 1.188S8.316 10.14 8.1 11.04c-.216.9-.18 1.788.108 2.664.288.876.78 1.62 1.476 2.232-.168-.3-.288-.6-.36-.9-.072-.3-.072-.612 0-.996z"/></svg>`),
  canva:    svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#00C4CC" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.097 15.515c-.437.631-1.19 1.069-1.934 1.069-1.178 0-1.769-.85-2.284-1.638-.363-.563-.671-1.028-1.026-1.028-.354 0-.662.47-1.024 1.033-.53.822-1.124 1.638-2.284 1.638-.742 0-1.497-.436-1.933-1.067-.392-.563-.57-1.281-.57-2.113 0-1.688.69-3.127 1.944-3.127 1.089 0 1.611 1.251 2.126 2.478.263.63.528 1.264.787 1.264.264 0 .528-.641.794-1.277.515-1.223 1.035-2.465 2.126-2.465 1.254 0 1.944 1.439 1.944 3.127-.001.833-.179 1.551-.666 2.106z"/></svg>`),
  amazon:   svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF9900" d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.047-.872-1.234-1.276-1.814-2.106-1.734 1.768-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.06-1.642-.384-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.977 2.469 9.068 1.5 11.846 1.5c1.44 0 3.32.384 4.454 1.476 1.439 1.342 1.301 3.134 1.301 5.086v4.607c0 1.385.576 1.993 1.117 2.741.19.267.232.587-.01.784-.604.505-1.678 1.443-2.269 1.973l-.295-.362zM24 18.558c-2.9 2.045-7.111 3.134-10.729 3.134-5.077 0-9.643-1.876-13.099-4.997-.272-.245-.029-.578.298-.388 3.732 2.17 8.344 3.476 13.1 3.476 3.212 0 6.748-.665 9.998-2.044.49-.208.9.326.432.819z"/></svg>`),
  linkedin: svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`),
  appletv:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`),
}

function formatPrice(amount: number, currencyCode: string): string {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR
  if (currencyCode === 'INR') return `${curr.symbol}${Math.round(amount)}`
  return `${curr.symbol}${parseFloat(amount.toFixed(2))}`
}

function calcPrice(baseINR: number, months: number, currencyCode: string) {
  const dur = DURATIONS.find(d => d.months === months) || DURATIONS[0]
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR
  const totalINR = Math.round(baseINR * dur.mult)
  const perMonthINR = Math.round(totalINR / months)
  const total = currencyCode === 'INR' ? totalINR : parseFloat((totalINR * curr.rate).toFixed(2))
  const perMonth = currencyCode === 'INR' ? perMonthINR : parseFloat((perMonthINR * curr.rate).toFixed(2))
  return { total, perMonth, symbol: curr.symbol, saveLabel: dur.saveLabel }
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { currencyCode } = useCurrency()
  const allProducts = useCatalogue()
  const [selectedMonths, setSelectedMonths] = useState(1)
  const [ordering, setOrdering] = useState(false)

  const id = typeof params.id === 'string' ? params.id : params.id?.[0]
  const product = allProducts.find(p => p.id === id)

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 18, color: '#555' }}>Product not found.</p>
        <Link href="/store" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: 14 }}>← Back to Store</Link>
      </div>
    )
  }

  const iconSrc = BRAND_ICONS[product.id]
  const { total, perMonth, saveLabel } = calcPrice(product.effectiveINR, selectedMonths, currencyCode)
  const originalTotal = product.discount ? calcPrice(product.customPrice ?? product.baseINR, selectedMonths, currencyCode).total : null
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR
  const isUPI = curr.pay === 'upi'

  const handleOrder = () => {
    setOrdering(true)
    const msg = encodeURIComponent(
      `Hi! I'd like to order *${product.name}* — ${selectedMonths} month${selectedMonths > 1 ? 's' : ''} for ${formatPrice(total, currencyCode)}.\n\nPlease confirm and send payment details.`
    )
    window.open(`https://wa.me/918111956481?text=${msg}`, '_blank')
    setTimeout(() => setOrdering(false), 2000)
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: 52 }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${product.color}18 0%, transparent 70%)` }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back */}
        <Link href="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#555', textDecoration: 'none', fontSize: 13, fontWeight: 500, marginBottom: 36, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f5f5f7')}
          onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
          <ArrowLeft size={15} /> Back to Store
        </Link>

        <div className="pk-product-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 32, alignItems: 'start' }}>

          {/* ── Left col ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: `${product.color}22`, border: `1px solid ${product.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {iconSrc
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={iconSrc} alt={product.name} width={48} height={48} style={{ objectFit: 'contain' }} />
                  : <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{product.name[0]}</span>
                }
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.03em' }}>{product.name}</h1>
                  {product.badge && (
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, background: `${product.color}22`, color: product.color, fontWeight: 700, letterSpacing: '0.08em' }}>{product.badge}</span>
                  )}
                  {product.stockOut && (
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, background: 'rgba(248,113,113,0.12)', color: '#f87171', fontWeight: 700, letterSpacing: '0.08em' }}>OUT OF STOCK</span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.6 }}>{product.description}</p>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {product.tags.map(tag => (
                <span key={tag} style={{ padding: '5px 12px', borderRadius: 980, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#a1a1a6', fontWeight: 500 }}>{tag}</span>
              ))}
            </div>

            {/* Features */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>What's included</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {product.features.map((f, i) => (
                  <motion.div key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${product.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color={product.color} />
                    </div>
                    <span style={{ fontSize: 14, color: '#a1a1a6' }}>{f}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { icon: <Zap size={16} />, label: 'Instant Delivery', sub: 'Within 5 minutes' },
                { icon: <Shield size={16} />, label: '100% Guaranteed', sub: 'Or full refund' },
                { icon: <Clock size={16} />, label: '24/7 Support', sub: 'Via WhatsApp' },
              ].map(b => (
                <div key={b.label} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ color: '#D4AF37', marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{b.icon}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#f5f5f7', marginBottom: 2 }}>{b.label}</p>
                  <p style={{ fontSize: 10, color: '#555' }}>{b.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right col — Order card ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="pk-sticky-card" style={{ position: 'sticky', top: 72, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, overflow: 'hidden' }}>

            {/* Color top bar */}
            <div style={{ height: 3, background: `linear-gradient(to right, ${product.color}, transparent)` }} />

            <div style={{ padding: 24 }}>
              {/* Price display */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Price per month</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <p style={{ fontSize: 36, fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {formatPrice(perMonth, currencyCode)}
                  </p>
                  <span style={{ fontSize: 14, color: '#555' }}>/mo</span>
                </div>
                {saveLabel && <p style={{ fontSize: 12, color: '#4ade80', marginTop: 4, fontWeight: 600 }}>{saveLabel}</p>}
                {(product.discount || 0) > 0 && (
                  <p style={{ fontSize: 12, color: '#60a5fa', marginTop: 2 }}>{product.discount}% discount applied 🎉</p>
                )}
              </div>

              {/* Duration selector */}
              <p style={{ fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Select duration</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {DURATIONS.map(dur => {
                  const { total: t, perMonth: pm } = calcPrice(product.effectiveINR, dur.months, currencyCode)
                  const sel = selectedMonths === dur.months
                  return (
                    <button key={dur.months} onClick={() => setSelectedMonths(dur.months)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: `1px solid ${sel ? product.color + '66' : 'rgba(255,255,255,0.07)'}`, background: sel ? `${product.color}12` : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? product.color : '#444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: product.color }} />}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: sel ? 700 : 400, color: sel ? '#f5f5f7' : '#6e6e73' }}>{dur.label}</span>
                        {dur.saveLabel && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontWeight: 700 }}>{dur.saveLabel}</span>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: sel ? '#f5f5f7' : '#555' }}>{formatPrice(t, currencyCode)}</p>
                        <p style={{ fontSize: 10, color: '#444' }}>{formatPrice(pm, currencyCode)}/mo</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Total */}
              <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#6e6e73' }}>Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f7' }}>{formatPrice(total, currencyCode)}</p>
                    {originalTotal && <p style={{ fontSize: 11, color: '#555', textDecoration: 'line-through' }}>{formatPrice(originalTotal, currencyCode)}</p>}
                  </div>
                </div>
                <p style={{ fontSize: 10, color: '#444', marginTop: 6 }}>
                  Pay via {isUPI ? 'UPI' : 'Wise'} · Delivered on WhatsApp within 5 min
                </p>
              </div>

              {/* CTA */}
              {product.stockOut ? (
                <div style={{ width: '100%', height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#555', fontSize: 14, fontWeight: 600 }}>
                  Currently Out of Stock
                </div>
              ) : (
                <button onClick={handleOrder} disabled={ordering}
                  style={{ width: '100%', height: 52, borderRadius: 14, background: ordering ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37, #C49A20)', border: 'none', color: '#000', fontSize: 15, fontWeight: 700, cursor: ordering ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s', boxShadow: '0 0 24px rgba(212,175,55,0.2)' }}
                  onMouseEnter={e => { if (!ordering) (e.currentTarget.style.opacity = '0.9') }}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  <MessageCircle size={17} />
                  {ordering ? 'Opening WhatsApp...' : 'Order via WhatsApp'}
                </button>
              )}

              <p style={{ textAlign: 'center', fontSize: 11, color: '#444', marginTop: 12 }}>
                Questions? <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', textDecoration: 'none' }}>Chat with us</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}