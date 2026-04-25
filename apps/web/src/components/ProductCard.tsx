'use client'

import { calcPrice, formatPrice, PRODUCTS, CURRENCIES } from '@primekeys/shared'
import { useCurrency } from '@/context/CurrencyContext'
import { useCatalogue, type CatalogueProduct } from '@/hooks/useCatalogue'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { useState } from 'react'

const svgDataUri = (svgContent: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`

const BRAND_ICONS: Record<string, string> = {
  netflix: svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E50914" d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 24c-.538.086-2.953.408-4.32.6L9.386 13.098v10.821L5.398 24V0z"/></svg>`),
  spotify: svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1DB954" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`),
  youtube: svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`),
  chatgpt: svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494z"/></svg>`),
  disney:   svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#113CCF" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/></svg>`),
  canva:    svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#00C4CC" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/></svg>`),
  amazon:   svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF9900" d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685z"/></svg>`),
  linkedin: svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>`),
  appletv:  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98z"/></svg>`),
}

interface ProductCardProps {
  product: CatalogueProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { currencyCode } = useCurrency()
  const { addToCart, items } = useCart()
  const [added, setAdded] = useState(false)

  // ── Our price ──────────────────────────────────────────────
  const customMonthlyPrice = product.customPrices?.[currencyCode]
  const { perMonth } = customMonthlyPrice !== undefined
    ? { perMonth: parseFloat((customMonthlyPrice * (1 - (product.discount || 0) / 100)).toFixed(2)) }
    : calcPrice(product.effectiveINR, 1, currencyCode)

  const originalPerMonth = (() => {
    if ((product.discount || 0) === 0) return null
    if (customMonthlyPrice !== undefined) return parseFloat(customMonthlyPrice.toFixed(2))
    return calcPrice(product.customPrice ?? product.baseINR, 1, currencyCode).perMonth
  })()

  // ── Market price (official retail) ─────────────────────────
  // Admin sets marketPriceINR (what Spotify, Netflix etc. charge officially)
  // We convert it to the user's currency using the same rate logic
  const marketPerMonth = (() => {
    if (!product.marketPriceINR) return null
    if (currencyCode === 'INR') return product.marketPriceINR
    const curr = CURRENCIES[currencyCode] || CURRENCIES.INR
    return parseFloat((product.marketPriceINR * curr.rate).toFixed(2))
  })()

  // Savings % vs official price
  const savingsPct = marketPerMonth && perMonth < marketPerMonth
    ? Math.round((1 - perMonth / marketPerMonth) * 100)
    : null

  // ── Display strings ────────────────────────────────────────
  const currSymbols: Record<string, string> = {
    USD: '$', AED: 'AED ', GBP: '£', EUR: '€',
    AUD: 'A$', SGD: 'S$', CAD: 'C$', MYR: 'RM ',
    QAR: 'QAR ', SAR: 'SAR ', KWD: 'KWD ',
  }
  const sym = currencyCode === 'INR' ? '₹' : (currSymbols[currencyCode] || currencyCode + ' ')

  const fmtNum = (n: number) => currencyCode === 'INR' ? `₹${Math.round(n)}` : `${sym}${parseFloat(n.toFixed(2))}`

  const displayPrice    = fmtNum(perMonth)
  const displayOriginal = originalPerMonth === null ? null : fmtNum(originalPerMonth)
  const displayMarket   = marketPerMonth === null   ? null : fmtNum(marketPerMonth)

  // Logo
  const iconSrc    = product.customLogo || BRAND_ICONS[product.id]
  const hasDiscount = (product.discount || 0) > 0
  const isStockOut  = product.stockOut || false
  const inCart      = items.some(i => i.product.id === product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isStockOut || inCart) return
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <Link href={`/store/${product.id}`} className="group block" style={{ textDecoration: 'none', pointerEvents: isStockOut ? 'none' : 'auto' }}>
      <div style={{
        background: '#1d1d1f',
        borderRadius: 20, padding: '20px 20px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
        minHeight: 240, cursor: isStockOut ? 'not-allowed' : 'pointer',
        transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s',
        opacity: isStockOut ? 0.5 : 1,
        position: 'relative', overflow: 'hidden',
        border: inCart ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
      }}
        onMouseEnter={e => {
          if (!isStockOut) {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1.02)'
            el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'
          }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'scale(1)'
          el.style.boxShadow = 'none'
        }}
      >
        {/* Stock out overlay */}
        {isStockOut && (
          <div style={{ position: 'absolute', top: 12, right: 12, padding: '3px 8px', borderRadius: 6, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', fontSize: 9, fontWeight: 800, color: '#f87171', letterSpacing: '0.1em' }}>
            OUT OF STOCK
          </div>
        )}

        {/* Savings badge (market vs our price) */}
        {savingsPct && !isStockOut && (
          <div style={{ position: 'absolute', top: 12, right: 12, padding: '3px 9px', borderRadius: 6, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', fontSize: 9, fontWeight: 800, color: '#4ade80', letterSpacing: '0.1em' }}>
            SAVE {savingsPct}%
          </div>
        )}

        {/* Discount badge (no market price set, fall back to product discount) */}
        {!savingsPct && hasDiscount && !isStockOut && (
          <div style={{ position: 'absolute', top: 12, right: 12, padding: '3px 8px', borderRadius: 6, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', fontSize: 9, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.1em' }}>
            {product.discount}% OFF
          </div>
        )}

        {/* Icon */}
        <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {iconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconSrc} alt={product.name} width={44} height={44} style={{ objectFit: 'contain', display: 'block', width: 44, height: 44, borderRadius: 8 }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 12, background: product.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
              {product.name[0]}
            </div>
          )}
        </div>

        {/* Name + Description */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {product.name}
          </h3>
          <p style={{ fontSize: 13, color: '#86868b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {product.description || 'Premium shared subscription'}
          </p>
        </div>

        {/* Market price comparison row */}
        {displayMarket && !isStockOut && (
          <div style={{
            padding: '7px 10px', borderRadius: 8,
            background: 'rgba(74,222,128,0.05)',
            border: '1px solid rgba(74,222,128,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 10, color: '#555', fontWeight: 500 }}>
              {product.name} charges
            </span>
            <span style={{ fontSize: 11, color: '#555', textDecoration: 'line-through', fontWeight: 600 }}>
              {displayMarket}/mo
            </span>
          </div>
        )}

        {/* Price + CTA row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <div>
            {displayMarket && !isStockOut && (
              <p style={{ fontSize: 10, fontWeight: 600, color: '#4ade80', letterSpacing: '0.04em', marginBottom: 1 }}>
                Our price
              </p>
            )}
            {!displayMarket && (
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>From</p>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: isStockOut ? '#555' : displayMarket ? '#4ade80' : '#f5f5f7', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {displayPrice}<span style={{ fontSize: 13, fontWeight: 400, color: '#6e6e73', marginLeft: 2 }}>/mo</span>
              </p>
              {displayOriginal && !isStockOut && (
                <p style={{ fontSize: 13, color: '#555', textDecoration: 'line-through' }}>
                  {displayOriginal}
                </p>
              )}
            </div>
          </div>

          {!isStockOut && (
            <button
              onClick={handleAddToCart}
              title={inCart ? 'Already in bag' : 'Add to bag'}
              style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: inCart || added
                  ? 'rgba(212,175,55,0.2)'
                  : 'rgba(255,255,255,0.07)',
                border: inCart || added
                  ? '1px solid rgba(212,175,55,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: inCart || added ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                cursor: inCart ? 'default' : 'pointer',
                transition: 'all 0.2s',
                transform: added ? 'scale(1.18)' : 'scale(1)',
              }}
            >
              {inCart || added ? (
                /* checkmark */
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              ) : (
                /* bag+ icon */
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path strokeLinecap="round" d="M12 11v6M9 14h6"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}