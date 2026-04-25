'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, ChevronRight, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { calcPrice, formatPrice, CURRENCIES, DURATIONS } from '@primekeys/shared'
import Link from 'next/link'

const svgDataUri = (s: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`
const BRAND_ICONS: Record<string, string> = {
  netflix:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E50914" d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 24c-.538.086-2.953.408-4.32.6L9.386 13.098v10.821L5.398 24V0z"/></svg>`),
  spotify:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1DB954" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`),
  youtube:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`),
  chatgpt:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#10a37f" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"/></svg>`),
  disney:   svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#113CCF" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/></svg>`),
  canva:    svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#00C4CC" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/></svg>`),
  amazon:   svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF9900" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/></svg>`),
  linkedin: svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>`),
  appletv:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#f5f5f7" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98z"/></svg>`),
}

const DURATION_OPTS = [
  { months: 1,  label: '1 Month'  },
  { months: 3,  label: '3 Months' },
  { months: 6,  label: '6 Months' },
  { months: 12, label: '1 Year'   },
]

export function CartDrawer() {
  const { items, removeFromCart, updateMonths, clearCart, isOpen, closeCart, totalItems } = useCart()
  const { currencyCode } = useCurrency()

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Compute price per item
  function itemPrice(productId: string, effectiveINR: number, customPrices: Record<string,number>|undefined, months: number) {
    const customMonthly = customPrices?.[currencyCode]
    if (customMonthly !== undefined) {
      const dur = DURATIONS.find(d => d.months === months) || DURATIONS[0]
      const total = parseFloat((customMonthly * (dur.mult / months) * months).toFixed(2))
      return { total, perMonth: parseFloat((total / months).toFixed(2)) }
    }
    const { total, perMonth } = calcPrice(effectiveINR, months, currencyCode)
    return { total, perMonth }
  }

  // Cart total
  const cartTotal = items.reduce((acc, item) => {
    const { total } = itemPrice(item.product.id, item.product.effectiveINR, item.product.customPrices, item.months)
    return acc + total
  }, 0)

  // Build checkout URL with all items encoded
  const checkoutParams = new URLSearchParams()
  items.forEach((item, i) => {
    checkoutParams.set(`p${i}`, item.product.id)
    checkoutParams.set(`m${i}`, String(item.months))
  })
  checkoutParams.set('count', String(items.length))
  const checkoutUrl = `/checkout/cart?${checkoutParams.toString()}`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            style={{
              position: 'fixed', inset: 0, zIndex: 900,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: 440 }}
            animate={{ x: 0 }}
            exit={{ x: 440 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 901,
              width: '100%', maxWidth: 420,
              background: 'rgba(8,8,10,0.98)',
              backdropFilter: 'saturate(180%) blur(20px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-20px 0 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShoppingBag size={15} color="#D4AF37" />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>
                    Your Bag
                  </p>
                  <p style={{ fontSize: 11, color: '#555' }}>
                    {totalItems} item{totalItems !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#a1a1a6',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 14, paddingBottom: 40,
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShoppingBag size={22} color="#333" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f7', marginBottom: 5 }}>Your bag is empty</p>
                    <p style={{ fontSize: 13, color: '#555' }}>Add subscriptions from the store</p>
                  </div>
                  <button
                    onClick={closeCart}
                    style={{
                      marginTop: 6, height: 40, padding: '0 22px', borderRadius: 10,
                      background: 'linear-gradient(135deg,#D4AF37,#C49A20)',
                      color: '#000', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Browse Store
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(item => {
                    const icon = item.product.customLogo || BRAND_ICONS[item.product.id]
                    const { total, perMonth } = itemPrice(
                      item.product.id, item.product.effectiveINR,
                      item.product.customPrices, item.months
                    )
                    const isStockOut = item.product.stockOut
                    return (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isStockOut ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: 14, padding: 14,
                          opacity: isStockOut ? 0.6 : 1,
                        }}
                      >
                        {/* Top row: icon + name + remove */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                            background: `${item.product.color}18`,
                            border: `1px solid ${item.product.color}33`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                          }}>
                            {icon
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={icon} alt={item.product.name} width={22} height={22} style={{ objectFit: 'contain' }} />
                              : <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{item.product.name[0]}</span>
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.01em' }}>
                              {item.product.name}
                            </p>
                            <p style={{ fontSize: 11, color: '#555' }}>
                              {isStockOut ? '⚠ Out of stock' : `${formatPrice(perMonth, currencyCode)}/mo`}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            style={{
                              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                              background: 'rgba(248,113,113,0.06)',
                              border: '1px solid rgba(248,113,113,0.15)',
                              color: '#f87171', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Duration picker */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                          {DURATION_OPTS.map(opt => {
                            const { total: t } = itemPrice(
                              item.product.id, item.product.effectiveINR,
                              item.product.customPrices, opt.months
                            )
                            const sel = item.months === opt.months
                            const durStockOut = (item.product.stockOutDurations || []).includes(opt.label)
                            return (
                              <button
                                key={opt.months}
                                onClick={() => { if (!durStockOut) updateMonths(item.product.id, opt.months) }}
                                disabled={durStockOut}
                                style={{
                                  flex: 1, minWidth: 60,
                                  height: 32, borderRadius: 7, fontSize: 11, fontWeight: sel ? 700 : 400,
                                  border: `1px solid ${durStockOut ? 'rgba(248,113,113,0.2)' : sel ? `${item.product.color}66` : 'rgba(255,255,255,0.07)'}`,
                                  background: durStockOut ? 'rgba(248,113,113,0.04)' : sel ? `${item.product.color}15` : 'transparent',
                                  color: durStockOut ? '#f87171' : sel ? '#f5f5f7' : '#555',
                                  cursor: durStockOut ? 'not-allowed' : 'pointer',
                                  opacity: durStockOut ? 0.55 : 1,
                                  transition: 'all 0.15s',
                                  display: 'flex', flexDirection: 'column',
                                  alignItems: 'center', justifyContent: 'center', gap: 1,
                                }}
                              >
                                <span>{opt.label}</span>
                                <span style={{ fontSize: 9, color: sel ? item.product.color : '#444', fontWeight: 600 }}>
                                  {durStockOut ? 'N/A' : (currencyCode === 'INR' ? `₹${Math.round(t)}` : `${(CURRENCIES[currencyCode] || CURRENCIES.INR).symbol}${t}`)}
                                </span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Item subtotal */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#555' }}>{item.months} month{item.months > 1 ? 's' : ''}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#D4AF37', letterSpacing: '-0.02em' }}>
                            {formatPrice(total, currencyCode)}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{
                padding: '16px', flexShrink: 0,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.4)',
              }}>
                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>Cart Total</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.03em' }}>
                      {formatPrice(cartTotal, currencyCode)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: '#444' }}>{items.length} subscription{items.length > 1 ? 's' : ''}</p>
                    <p style={{ fontSize: 10, color: '#444' }}>WhatsApp delivery • 5 min</p>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={checkoutUrl}
                  onClick={closeCart}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    height: 50, borderRadius: 12,
                    background: 'linear-gradient(135deg,#D4AF37,#C49A20)',
                    color: '#000', textDecoration: 'none',
                    fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Checkout All <ArrowRight size={16} />
                </Link>

                <button
                  onClick={clearCart}
                  style={{
                    marginTop: 8, width: '100%', height: 34,
                    background: 'transparent', border: 'none',
                    color: '#444', fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <Trash2 size={11} /> Clear bag
                </button>

                <p style={{ textAlign: 'center', fontSize: 11, color: '#333', marginTop: 6 }}>
                  Free delivery • 100% official accounts
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
