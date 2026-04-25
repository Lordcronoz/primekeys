'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useEffect } from 'react'

// ─── Cursor glow ──────────────────────────────────────────────────────────────
function CursorGlow() {
  useEffect(() => {
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

// ─── Section reveal ───────────────────────────────────────────────────────────
function SectionReveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 36 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
      }}
      style={style}
    >{children}</motion.div>
  )
}

function StaggerReveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px 0px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13 } } }}
      style={style}
    >{children}</motion.div>
  )
}

function StaggerChild({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 32 },
      show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    }}>
      {children}
    </motion.div>
  )
}

// ─── Team data with motivation ────────────────────────────────────────────────
// Premium SVG icon components — no emojis
const IconFounder = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,11.5 3.5,15 5,9.5 1,6 6,6" fill="currentColor" opacity="0.9"/>
  </svg>
)
const IconCoFounder = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/>
    <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/>
  </svg>
)
const IconRelations = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" fill="currentColor"/>
    <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
)
const IconMarketing = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M2 11 L7 4 L10 8 L12 6 L14 11 Z" fill="currentColor" opacity="0.9"/>
    <circle cx="12" cy="4" r="2" fill="currentColor" opacity="0.6"/>
  </svg>
)

const TEAM = [
  {
    name: 'Aaron Joy Thomas',
    title: 'Founder & CEO',
    initial: 'A',
    Icon: IconFounder,
    color: 'from-[#D4AF37] to-[#C49A20]',
    gradientFrom: '#D4AF37',
    gradientTo: '#b8860b',
    motivation: '"I got tired of seeing students pay full price for tools that should be accessible to everyone. PrimeKeys is my way of leveling the playing field."',
    social: null,
  },
  {
    name: 'Nicholson Samuel Varghese',
    title: 'Co-Founder & Managing Director',
    initial: 'N',
    Icon: IconCoFounder,
    gradientFrom: '#9b59b6',
    gradientTo: '#6c3483',
    motivation: '"Building systems that just work — fast delivery, no drama, real accounts. That\'s the standard I hold us to every single day."',
    social: null,
  },
  {
    name: 'Devika Prasannan',
    title: 'Head of Client Relations',
    initial: 'D',
    Icon: IconRelations,
    gradientFrom: '#e74c3c',
    gradientTo: '#c0392b',
    motivation: '"Every customer is someone trusting us with their money. I make sure that trust is never broken — and that every experience feels personal."',
    social: null,
  },
  {
    name: 'Shayanika Bhattacharjee',
    title: 'Head of Social Media & Marketing',
    initial: 'S',
    Icon: IconMarketing,
    gradientFrom: '#2ecc71',
    gradientTo: '#1a9e57',
    motivation: '"Great products deserve great stories. I tell ours — loud, real, and in a way that actually reaches the people who need us most."',
    social: null,
  },
]

// ─── Interactive Team Card ────────────────────────────────────────────────────
function TeamCard({ member }: { member: (typeof TEAM)[0] }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      style={{
        perspective: '1000px',
        cursor: 'pointer',
        height: 320,
      }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ── FRONT ──────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          borderRadius: 24,
          background: '#0e0e0e',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20, padding: '32px 24px', textAlign: 'center',
          overflow: 'hidden',
        }}>
          {/* Subtle bg glow behind avatar */}
          <div style={{
            position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 200, borderRadius: '50%',
            background: `radial-gradient(circle, ${member.gradientFrom}22 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `linear-gradient(135deg, ${member.gradientFrom}, ${member.gradientTo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 800, color: '#fff',
            boxShadow: `0 0 28px ${member.gradientFrom}55`,
            position: 'relative', zIndex: 1,
            flexShrink: 0,
          }}>
            {member.initial}
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontSize: 17, fontWeight: 700, color: '#f5f5f7',
              letterSpacing: '-0.02em', marginBottom: 6,
            }}>
              {member.name}
            </p>
            <p style={{
              fontSize: 12, fontWeight: 500, color: member.gradientFrom,
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {member.title}
            </p>
          </div>

          {/* Hover hint */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 14px', borderRadius: 980,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            <span style={{ fontSize: 10, color: '#4a4a50', letterSpacing: '0.08em', fontWeight: 500 }}>
              HOVER TO LEARN MORE
            </span>
          </div>
        </div>

        {/* ── BACK ───────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 24,
          background: `linear-gradient(135deg, ${member.gradientFrom}18, ${member.gradientTo}0a)`,
          border: `1px solid ${member.gradientFrom}35`,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '32px 28px',
          overflow: 'hidden',
        }}>
          {/* Corner glow */}
          <div style={{
            position: 'absolute', bottom: -30, right: -30,
            width: 160, height: 160, borderRadius: '50%',
            background: `radial-gradient(circle, ${member.gradientFrom}20, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Top: name + role pill */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 980,
              background: `${member.gradientFrom}18`,
              border: `1px solid ${member.gradientFrom}30`,
              marginBottom: 14,
            }}>
              <span style={{ color: member.gradientFrom, display: 'flex', alignItems: 'center' }}><member.Icon /></span>
              <span style={{ fontSize: 10, fontWeight: 700, color: member.gradientFrom, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {member.title}
              </span>
            </div>
            <p style={{
              fontSize: 18, fontWeight: 800, color: '#f5f5f7',
              letterSpacing: '-0.025em', lineHeight: 1.2,
            }}>
              {member.name}
            </p>
          </div>

          {/* Middle: motivation quote */}
          <div>
            {/* gold quote mark */}
            <svg width="24" height="18" viewBox="0 0 32 24" fill={member.gradientFrom} style={{ opacity: 0.6, marginBottom: 10 }}>
              <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l2.4 3.2C11.2 4 8 7.2 8 12h6.4V24H0zm17.6 0V14.4C17.6 6.4 22.4 1.6 32 0l2.4 3.2C28.8 4 25.6 7.2 25.6 12H32V24H17.6z"/>
            </svg>
            <p style={{
              fontSize: 14, color: '#a1a1a6', lineHeight: 1.7,
              fontStyle: 'italic',
            }}>
              {member.motivation}
            </p>
          </div>

          {/* Bottom accent line */}
          <div style={{
            height: 2, borderRadius: 2,
            background: `linear-gradient(to right, ${member.gradientFrom}, ${member.gradientTo}55, transparent)`,
          }} />
        </div>
      </motion.div>
    </div>
  )
}

// ─── Page data ────────────────────────────────────────────────────────────────
const stats = [
  { value: '2024', label: 'Founded' },
  { value: '50+', label: 'Subscription plans' },
  { value: '5 min', label: 'Avg. delivery time' },
  { value: '70–80%', label: 'Average savings' },
]

// Premium SVG icon components for values section
const ValIconAccessibility = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="#D4AF37" strokeWidth="1.5" opacity="0.3"/>
    <path d="M14 7 L14 21 M7 14 L21 14" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="14" cy="14" r="3" fill="#D4AF37"/>
  </svg>
)
const ValIconTrust = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 3 L22 7 L22 15 C22 19.4 18.4 23.2 14 25 C9.6 23.2 6 19.4 6 15 L6 7 Z" stroke="#D4AF37" strokeWidth="1.5" fill="rgba(212,175,55,0.08)"/>
    <path d="M10 14 L13 17 L18 12" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ValIconSimplicity = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="4" fill="#D4AF37"/>
    <circle cx="14" cy="14" r="8" stroke="#D4AF37" strokeWidth="1.2" opacity="0.4"/>
    <circle cx="14" cy="14" r="12" stroke="#D4AF37" strokeWidth="0.8" opacity="0.2"/>
  </svg>
)
const ValIconCommunity = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="10" cy="11" r="3.5" stroke="#D4AF37" strokeWidth="1.5"/>
    <circle cx="18" cy="11" r="3.5" stroke="#D4AF37" strokeWidth="1.5"/>
    <path d="M4 22 C4 18 6.7 15.5 10 15.5" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M18 15.5 C21.3 15.5 24 18 24 22" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M12 22 C12 19 13 17 14 17 C15 17 16 19 16 22" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
  </svg>
)

const values = [
  {
    Icon: ValIconAccessibility,
    title: 'Accessibility',
    body: 'Premium software shouldn\'t be a luxury. We built PRIMEKEYS so every student, freelancer, and creator can afford the tools they actually need.',
  },
  {
    Icon: ValIconTrust,
    title: 'Trust',
    body: 'Every order is backed by real delivery via WhatsApp, within 5 minutes. No bots, no waiting, no guessing — just credentials that work.',
  },
  {
    Icon: ValIconSimplicity,
    title: 'Simplicity',
    body: 'Browse, pick, pay, done. No complicated sign-ups, no hidden fees. We designed the experience to be as frictionless as possible.',
  },
  {
    Icon: ValIconCommunity,
    title: 'Community',
    body: 'Started by two college students who got tired of paying full price, PRIMEKEYS is built by young people, for everyone.',
  },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <CursorGlow />

      {/* ════════════════════════════════════════ HERO */}
      <section className="pk-grain" style={{
        position: 'relative', paddingTop: 120, paddingBottom: 80,
        textAlign: 'center', overflow: 'hidden',
      }}>
        {/* Orbs */}
        <div className="orb-a" style={{
          position: 'absolute', top: '-10%', left: '20%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="orb-b" style={{
          position: 'absolute', top: '20%', right: '5%',
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,60,220,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          background: 'linear-gradient(to bottom, transparent, #000)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 16px 6px 10px',
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: 980, marginBottom: 28,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', boxShadow: '0 0 6px rgba(212,175,55,0.8)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#D4AF37', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Our Story
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800,
              letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 28,
            }}
          >
            <span style={{ color: '#f5f5f7', display: 'block' }}>Built by students.</span>
            <span className="pk-shimmer-text">For everyone.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="speakable"
            style={{ fontSize: 19, color: '#6e6e73', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px' }}
          >
            PRIMEKEYS is a digital subscription reseller based in Kerala, India. We provide Netflix, Spotify, ChatGPT Plus, Microsoft 365, Windows keys, and VPN subscriptions worldwide at up to 80% off the official price, with delivery to your WhatsApp in under 5 minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/store" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 50, padding: '0 28px',
              background: 'linear-gradient(135deg, #D4AF37, #C49A20)',
              color: '#000', border: 'none', borderRadius: 980,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 0 24px rgba(212,175,55,0.25)',
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = '0.88'; el.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = '1'; el.style.transform = 'scale(1)' }}
            >
              Explore the store →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── GOLD DIVIDER */}
      <hr className="pk-divider" />

      {/* ════════════════════════════════════════ STATS */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {stats.map(({ value, label }) => (
            <StaggerChild key={label}>
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: '32px 24px', textAlign: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                  background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)',
                }} />
                <p style={{ fontSize: 40, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.04em', marginBottom: 6 }}>{value}</p>
                <p style={{ fontSize: 13, color: '#6e6e73', fontWeight: 500 }}>{label}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerReveal>
      </section>

      {/* ── GOLD DIVIDER */}
      <hr className="pk-divider" />



      {/* ════════════════════════════════════════ ORIGIN STORY */}
      <SectionReveal style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '48px 44px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
            background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)',
          }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>
            The Origin
          </p>
          <p style={{ fontSize: 18, color: '#7a7a80', lineHeight: 1.8, marginBottom: 20 }}>
            We were students. Between assignments, side projects, and trying to keep up with the latest tools,
            we kept hitting the same wall — subscription costs that added up to more than our monthly budgets.
          </p>
          <p style={{ fontSize: 18, color: '#7a7a80', lineHeight: 1.8, marginBottom: 20 }}>
            Netflix, Spotify, Canva, ChatGPT — every tool we needed came with a price tag designed for
            someone earning a full salary. So we asked: what if we could change that?
          </p>
          <p style={{ fontSize: 18, color: '#f5f5f7', lineHeight: 1.8, fontWeight: 500 }}>
            In 2024, we launched <strong style={{ color: '#D4AF37' }}>PRIMEKEYS</strong> — a platform
            that makes premium subscriptions genuinely accessible, delivered in under 5 minutes, at 70–80% off
            what you'd pay anywhere else.
          </p>
        </div>
      </SectionReveal>

      {/* ── GOLD DIVIDER */}
      <hr className="pk-divider" />

      {/* ════════════════════════════════════════ VALUES */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <SectionReveal style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>What We Stand For</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.04em' }}>
            Our values
          </h2>
        </SectionReveal>

        <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16, alignItems: 'stretch' }}>
          {values.map(({ Icon, title, body }) => (
            <StaggerChild key={title}>
              <div className="pk-hover" style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: '28px 32px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ marginBottom: 16 }}><Icon /></div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f5f5f7', marginBottom: 10, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.7, flex: 1 }}>{body}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerReveal>
      </section>

      {/* ── GOLD DIVIDER */}
      <hr className="pk-divider" />

      {/* ════════════════════════════════════════ TEAM */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '80px 24px 100px' }}>
        <SectionReveal style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>The People</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.04em', marginBottom: 12 }}>
            Meet the team
          </h2>
          <p style={{ fontSize: 15, color: '#4a4a50' }}>Hover over a card to learn what drives us.</p>
        </SectionReveal>

        <StaggerReveal style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20, marginTop: 56,
        }}>
          {TEAM.map(member => (
            <StaggerChild key={member.name}>
              <TeamCard member={member} />
            </StaggerChild>
          ))}
        </StaggerReveal>
      </section>

      {/* ── GOLD DIVIDER */}
      <hr className="pk-divider" />

      {/* ════════════════════════════════════════ CTA */}
      <SectionReveal style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 120px', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(212,175,55,0.04)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 28, padding: '60px 48px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
            background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)',
          }} />
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.035em', marginBottom: 16 }}>
            Ready to save?
          </h2>
          <p style={{ fontSize: 16, color: '#6e6e73', marginBottom: 36, lineHeight: 1.6 }}>
            Join thousands of smart subscribers who stopped overpaying for the tools they love.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/store" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 52, padding: '0 32px',
              background: 'linear-gradient(135deg, #D4AF37, #C49A20)',
              color: '#000', borderRadius: 980, textDecoration: 'none',
              fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
              boxShadow: '0 0 20px rgba(212,175,55,0.2)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
            >
              Browse the Store
            </Link>
            <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 52, padding: '0 32px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#8a8a90', borderRadius: 980, textDecoration: 'none',
              fontSize: 16, fontWeight: 500, transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(212,175,55,0.35)'; el.style.color = '#f5f5f7' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(255,255,255,0.1)'; el.style.color = '#8a8a90' }}
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </SectionReveal>

    </div>
  )
}
