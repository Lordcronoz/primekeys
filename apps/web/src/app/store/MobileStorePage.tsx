'use client'

import { useState } from 'react'
import { CATEGORIES } from '@primekeys/shared'
import { ProductCard } from '@/components/ProductCard'

const catIcons: Record<string, React.ReactNode> = {
  all: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  streaming: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  music: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  ai: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>,
  productivity: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>,
}

export default function MobileStorePage({ products: allProducts }: { products: any[] }) {
  const [active, setActive] = useState('all')
  const products = active === 'all' ? allProducts : allProducts.filter(p => p.category === active)

  return (
    <main style={{ background: '#000', minHeight: '100vh', paddingTop: 52 }}>
      <div className="pk-grain" style={{ position: 'relative', overflow: 'hidden', padding: '40px 20px 32px', textAlign: 'center' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px 6px 10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 980, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#D4AF37', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Catalog</span>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8, color: '#f5f5f7' }}>
            Every subscription.
          </h1>
          <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 }}>
            <span className="pk-shimmer-text">Fraction of the price.</span>
          </h1>
          <p style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.6 }}>
            Official accounts. Instant WhatsApp delivery.
          </p>
        </div>
      </div>

      <hr className="pk-divider" />

      <div style={{ padding: '32px 20px 80px' }}>
        {/* Categories - Horizontal Scroll */}
        <div style={{ 
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 24, 
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }} className="hide-scrollbar">
          {CATEGORIES.map(cat => {
            const sel = active === cat.id
            return (
              <button key={cat.id} onClick={() => setActive(cat.id)}
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', 
                  borderRadius: 980, border: sel ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.08)', 
                  fontSize: 13, fontWeight: sel ? 600 : 400, cursor: 'pointer', 
                  background: sel ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', 
                  color: sel ? '#D4AF37' : '#6e6e73', whiteSpace: 'nowrap'
                }}>
                <span style={{ color: sel ? '#D4AF37' : '#4a4a50' }}>{catIcons[cat.id] ?? catIcons.all}</span>
                {cat.label}
              </button>
            )
          })}
        </div>

        <p style={{ fontSize: 11, color: '#3a3a3e', marginBottom: 16, letterSpacing: '0.02em' }}>
          {products.length} subscription{products.length !== 1 ? 's' : ''} available
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#3a3a3e' }}>
            <p style={{ fontSize: 14 }}>No products in this category yet.</p>
          </div>
        )}

        <div style={{ marginTop: 48, padding: '24px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f5f5f7', marginBottom: 4 }}>Need something custom?</p>
          <p style={{ fontSize: 13, color: '#6e6e73', lineHeight: 1.5, marginBottom: 20 }}>Bulk orders or a platform not listed — we&apos;ve got you.</p>
          <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 980, background: 'linear-gradient(135deg, #D4AF37, #C49A20)', color: '#000', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            WhatsApp us
          </a>
        </div>
      </div>
    </main>
  )
}
