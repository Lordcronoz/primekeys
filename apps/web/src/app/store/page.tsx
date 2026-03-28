'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { CATEGORIES } from '@primekeys/shared'
import { ProductCard } from '@/components/ProductCard'
import { useCatalogue } from '@/hooks/useCatalogue'

function CursorGlow() {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const glow = document.createElement('div')
    glow.id = 'pk-cursor-glow'
    document.body.appendChild(glow)
    const move = (e: MouseEvent) => {
      glow.style.left = e.clientX + 'px'
      glow.style.top = e.clientY + 'px'
    }
    window.addEventListener('mousemove', move)
    return () => { window.removeEventListener('mousemove', move); document.body.removeChild(glow) }
  }, [])
  return null
}

function SectionReveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as any } } }}
      style={style}
    >{children}</motion.div>
  )
}

const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }
const staggerItem = { hidden: { opacity: 0, y: 28, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any } } }

function StaggerReveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px 0px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'} variants={staggerContainer} style={style}>
      {children}
    </motion.div>
  )
}

function StaggerChild({ children }: { children: React.ReactNode }) {
  return <motion.div variants={staggerItem}>{children}</motion.div>
}

const catIcons: Record<string, React.ReactNode> = {
  all: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  streaming: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  music: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  ai: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>,
  productivity: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>,
}

export default function StorePage() {
  const [active, setActive] = useState('all')
  const allProducts = useCatalogue()
  const products = active === 'all' ? allProducts : allProducts.filter(p => p.category === active)
  // Only show available products (hide stock out from listing — or show greyed out, your choice)
  // We show them greyed out so customers know they exist

  return (
    <main style={{ background: '#000', minHeight: '100vh', paddingTop: 52 }}>
      <CursorGlow />

      <div className="pk-grain" style={{ position: 'relative', overflow: 'hidden', padding: '80px 28px 72px', textAlign: 'center' }}>
        <div className="orb-a" style={{ position: 'absolute', top: '-20%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="orb-b" style={{ position: 'absolute', top: '0%', right: '10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,60,220,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, transparent, #000)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px 6px 10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 980, marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', boxShadow: '0 0 6px rgba(212,175,55,0.8)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#D4AF37', letterSpacing: '0.18em', textTransform: 'uppercase' }}>PRIMEKEYS Catalog</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>
            <span style={{ color: '#f5f5f7' }}>Every subscription.</span>
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 28 }}>
            <span className="pk-shimmer-text">Fraction of the price.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 18, color: '#6e6e73', maxWidth: 460, margin: '0 auto', lineHeight: 1.65 }}>
            Official accounts. Instant WhatsApp delivery. No setup. No hassle. Just access.
          </motion.p>
        </div>
      </div>

      <hr className="pk-divider" />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '56px 28px 120px' }}>
        <SectionReveal style={{ marginBottom: 52 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const sel = active === cat.id
              return (
                <motion.button key={cat.id} onClick={() => setActive(cat.id)} whileTap={{ scale: 0.95 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 980, border: sel ? '1px solid rgba(212,175,55,0.55)' : '1px solid rgba(255,255,255,0.08)', fontSize: 13, fontWeight: sel ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease', background: sel ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', color: sel ? '#D4AF37' : '#6e6e73', letterSpacing: '-0.01em', boxShadow: sel ? '0 0 12px rgba(212,175,55,0.12)' : 'none' }}>
                  <span style={{ color: sel ? '#D4AF37' : '#4a4a50' }}>{catIcons[cat.id] ?? catIcons.all}</span>
                  {cat.label}
                </motion.button>
              )
            })}
          </div>
        </SectionReveal>

        <motion.p key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          style={{ fontSize: 12, color: '#3a3a3e', marginBottom: 24, letterSpacing: '0.02em' }}>
          {products.length} subscription{products.length !== 1 ? 's' : ''}
          {active !== 'all' ? ` in ${CATEGORIES.find(c => c.id === active)?.label ?? active}` : ' available'}
        </motion.p>

        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, alignItems: 'stretch' }}>
              {products.map(product => (
                <StaggerChild key={product.id}>
                  <ProductCard product={product} />
                </StaggerChild>
              ))}
            </StaggerReveal>
            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#3a3a3e' }}>
                <p style={{ fontSize: 16 }}>No products in this category yet.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <SectionReveal delay={0.1}>
          <div style={{ marginTop: 80, padding: '36px 32px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: 20, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 4 }}>Need something custom?</p>
              <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.5 }}>Bulk orders, gift accounts, or a platform not listed — we&apos;ve got you.</p>
            </div>
            <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 980, background: 'linear-gradient(135deg, #D4AF37 0%, #C49A20 100%)', color: '#000', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'opacity 0.2s, transform 0.15s', boxShadow: '0 0 20px rgba(212,175,55,0.2)' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = '0.88'; el.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = '1'; el.style.transform = 'scale(1)' }}>
              WhatsApp us
            </a>
          </div>
        </SectionReveal>

        <p style={{ textAlign: 'center', marginTop: 36, fontSize: 12, color: '#2a2a2e', letterSpacing: '-0.01em' }}>
          All subscriptions include a 100% delivery guarantee. Official accounts only.
        </p>
      </div>
    </main>
  )
}