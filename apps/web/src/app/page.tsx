'use client'

import Link from 'next/link'
import { useRef, useState, useEffect, useMemo } from 'react'
import { motion, useInView, Variants } from 'framer-motion'
import { Ticker } from '@/components/Ticker'
import { useCatalogue } from '@/hooks/useCatalogue'
import { ProductCard } from '@/components/ProductCard'
import MobilePage from './MobilePage'

// Detect touch/mobile once at module level
function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => {
      setMobile(
        typeof window !== 'undefined' &&
        (window.matchMedia('(pointer: coarse)').matches ||
         window.innerWidth <= 768)
      )
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return mobile
}

// ─── Cursor glow tracker (Desktop Only) ──────────────────────────────────────
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
    return () => {
      window.removeEventListener('mousemove', move)
      document.body.removeChild(glow)
    }
  }, [])
  return null
}

// ─── Motion variants ──────────────────────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Section reveal wrapper (Desktop Only) ───────────────────────────────────
function SectionReveal({
  children, delay = 0, className, style,
}: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 44 },
        show: { opacity: 1, y: 0, transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className} style={style}
    >{children}</motion.div>
  )
}

// ─── Staggered grid reveal (Desktop Only) ────────────────────────────────────
function StaggerReveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={staggerContainer} style={style}
    >{children}</motion.div>
  )
}

function StaggerChild({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <motion.div variants={staggerItem} style={style}>{children}</motion.div>
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function Stars({ n = 5 }: { n?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '28px 20px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 18,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
        background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)',
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(212,175,55,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(212,175,55,0.15)',
      }}>
        {icon}
      </div>
      <p style={{
        fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800,
        color: '#f5f5f7', letterSpacing: '-0.04em', lineHeight: 1,
      }}>
        {value}
      </p>
      <p style={{ fontSize: 13, color: '#6e6e73', fontWeight: 500, letterSpacing: '0.01em' }}>
        {label}
      </p>
    </div>
  )
}

// ─── How-it-works icon ────────────────────────────────────────────────────────
function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: '1.5px solid rgba(212,175,55,0.4)',
      background: 'radial-gradient(circle at 40% 40%, rgba(212,175,55,0.12), transparent 70%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

// ─── SVG icons ───────────────────────────────────────────────────────────────
const iconColor = '#D4AF37'

const IconBrowse = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M9 3v18M15 9h3M15 13h3"/>
  </svg>
)
const IconPay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="3"/>
    <path d="M2 9h20"/>
    <path d="M6 15h4"/>
  </svg>
)
const IconDeliver = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
    <path d="M22 16.74A10 10 0 0 1 3.55 18M2 7.26A10 10 0 0 1 20.45 6"/>
    <path d="m9 17-2 3-3-1M18 1l2 3-3 1"/>
  </svg>
)

export default function LandingPage() {
  const isMob = useIsMobile()
  const products = useCatalogue()
  const featured = useMemo(() => products.filter(p => p.featured).slice(0, 4), [products])

  if (isMob) return <MobilePage featured={featured} />

  return (
    <main className="pk-grain" style={{ background: '#000', minHeight: '100vh' }}>
      <CursorGlow />

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div className="orb-a" style={{ position: 'absolute', top: '-10%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1 }} />
        <div className="orb-b" style={{ position: 'absolute', bottom: '10%', right: '5%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 1 }} />

        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 24px 80px',
          boxSizing: 'border-box',
        }}>

          {/* Gold badge pill */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 16px 6px 10px',
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: 980, marginBottom: 28,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', boxShadow: '0 0 6px rgba(212,175,55,0.8)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#D4AF37', letterSpacing: '0.18em', textTransform: 'uppercase' }}>S&M Holdings</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(42px, 7.5vw, 96px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.0, color: '#f5f5f7', maxWidth: 980, marginBottom: 10 }}
          >Premium Subscriptions.</motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(42px, 7.5vw, 96px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.0, maxWidth: 980, marginBottom: 28 }}
          ><span className="pk-shimmer-text">Fraction of the price.</span></motion.h1>

          {/* Subheadline */}
          <p style={{ fontSize: 18, fontWeight: 400, color: '#7a7a80', maxWidth: 500, lineHeight: 1.65, marginBottom: 40 }}>
            Netflix, Spotify, ChatGPT Plus &amp; more — up to{' '}
            <span style={{ color: '#f5f5f7', fontWeight: 600 }}>80% off</span>. Delivered to your WhatsApp in{' '}
            <span style={{ color: '#f5f5f7', fontWeight: 600 }}>under 5 minutes</span>.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/store" style={{
              textDecoration: 'none', height: 54, padding: '0 38px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #C49A20 100%)',
              color: '#000', borderRadius: 980, fontSize: 16, fontWeight: 700,
              letterSpacing: '-0.01em',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(212,175,55,0.25)',
            }}>
              Explore Store
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>

            <a href="#how-it-works" style={{
              textDecoration: 'none', height: 54, padding: '0 38px',
              background: 'rgba(255,255,255,0.05)',
              color: '#8a8a90', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 980, fontSize: 16, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              How it works ↓
            </a>
          </div>
        </div>

        {/* ── TICKER ─────────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <Ticker />
        </div>
      </div>

      <hr className="pk-divider" />

      {/* ══════════════════════════════════════════════════
          TRUST STATS STRIP
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionReveal style={{ marginBottom: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase' }}>
              Trusted by thousands
            </p>
          </SectionReveal>

          <StaggerReveal style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, marginTop: 28,
          }}>
            <StaggerChild>
              <StatCard value="10K+" label="Happy customers" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              } />
            </StaggerChild>
            <StaggerChild>
              <StatCard value="&lt;5 min" label="Average delivery time" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              } />
            </StaggerChild>
            <StaggerChild>
              <StatCard value="80%" label="Savings vs official price" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              } />
            </StaggerChild>
            <StaggerChild>
              <StatCard value="100%" label="Official accounts" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
                  <path d="m9 12 2 2 4-4"/><path d="M12 1a11 11 0 1 0 0 22A11 11 0 0 0 12 1z"/>
                </svg>
              } />
            </StaggerChild>
          </StaggerReveal>
        </div>
      </section>

      <hr className="pk-divider" />

      {/* ══════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
            Most popular
          </p>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700,
            letterSpacing: '-0.04em', color: '#f5f5f7', marginBottom: 14,
          }}>
            The platforms you love.
          </h2>
          <p style={{ fontSize: 18, color: '#6e6e73', fontWeight: 400 }}>
            At a price that actually makes sense.
          </p>
        </SectionReveal>

        <StaggerReveal style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {featured.map(product => (
            <StaggerChild key={product.id}>
              <ProductCard product={product} />
            </StaggerChild>
          ))}
        </StaggerReveal>

        <SectionReveal delay={0.1} style={{ textAlign: 'center', marginTop: 52 }}>
          <Link href="/store" style={{
            textDecoration: 'none', height: 48, padding: '0 32px',
            background: 'rgba(255,255,255,0.05)',
            color: '#8a8a90', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 980, fontSize: 14, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            View all subscriptions →
          </Link>
        </SectionReveal>
      </section>

      <hr className="pk-divider" />

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
              How it works
            </p>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700,
              letterSpacing: '-0.04em', color: '#f5f5f7', marginBottom: 14,
            }}>
              Dead simple. Three steps.
            </h2>
            <p style={{ fontSize: 18, color: '#6e6e73' }}>No accounts needed. No complicated setups.</p>
          </SectionReveal>

          <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[
              {
                n: '01', icon: <IconBrowse />, title: 'Pick your plan',
                body: 'Browse the catalog and select your subscription and duration. Longer plans save up to 21%.',
              },
              {
                n: '02', icon: <IconPay />, title: 'Pay securely',
                body: 'Checkout in seconds via UPI (India) or Wise (international). No hidden fees, ever.',
              },
              {
                n: '03', icon: <IconDeliver />, title: 'Get access instantly',
                body: 'Your official credentials are sent directly to your WhatsApp in under 5 minutes.',
              },
            ].map(({ n, icon, title, body }) => (
              <StaggerChild key={n}>
                <div style={{
                  background: '#111',
                  borderRadius: 22, padding: '32px 28px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  height: '100%', position: 'relative'
                }}>
                  <StepIcon>{icon}</StepIcon>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f5f5f7', marginBottom: 12 }}>{title}</h3>
                  <p style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.6 }}>{body}</p>
                </div>
              </StaggerChild>
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  )
}
