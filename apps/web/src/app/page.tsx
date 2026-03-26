'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion, useInView, Variants } from 'framer-motion'
import { Ticker } from '@/components/Ticker'
import { useCatalogue } from '@/hooks/useCatalogue'
import { ProductCard } from '@/components/ProductCard'
import { useEffect } from 'react'

// ─── Cursor glow tracker ──────────────────────────────────────────────────────
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

// ─── Section reveal wrapper ───────────────────────────────────────────────────
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

// ─── Staggered grid reveal ────────────────────────────────────────────────────
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

// ─── Testimonial card ─────────────────────────────────────────────────────────
function TestimonialCard({
  quote, name, handle, avatar,
}: { quote: string; name: string; handle: string; avatar: string }) {
  return (
    <div className="pk-glass pk-hover" style={{
      borderRadius: 20, padding: '28px 28px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* subtle gold top border */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)',
      }} />
      <Stars />
      <p style={{
        fontSize: 15, color: '#c9c9cc', lineHeight: 1.7,
        marginTop: 14, marginBottom: 20,
        fontStyle: 'italic',
      }}>
        &ldquo;{quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37 0%, #C49A20 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0,
        }}>
          {avatar}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f7' }}>{name}</p>
          <p style={{ fontSize: 12, color: '#6e6e73' }}>{handle}</p>
        </div>
      </div>
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

// ─── TESTIMONIALS DATA ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Got my Netflix credentials in literally 3 minutes. Saved ₹400 compared to the official price. This is legitimately the best deal on the internet.",
    name: "Arjun Mehta",
    handle: "@arjunm · Delhi",
    avatar: "A",
  },
  {
    quote: "Was skeptical at first but decided to try Spotify. Account worked perfectly, delivery via WhatsApp was super fast. Been using it for 6 months now.",
    name: "Riya Shah",
    handle: "@riyashah · Mumbai",
    avatar: "R",
  },
  {
    quote: "ChatGPT Plus for ₹899/mo instead of ₹1900? Crazy value. No setup, no hassle — just works. Told all my college friends.",
    name: "Karan Verma",
    handle: "@karanv · Bangalore",
    avatar: "K",
  },
]

// ─── Review form ─────────────────────────────────────────────────────────────
interface UserReview {
  name: string; quote: string; stars: number; handle: string; avatar: string;
}

function ReviewForm() {
  const [stars, setStars] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [open, setOpen] = useState(false)

  const submit = () => {
    if (!name.trim() || !msg.trim()) return
    setReviews(r => [{
      name: name.trim(),
      quote: msg.trim(),
      stars,
      handle: 'Verified customer',
      avatar: name.trim()[0].toUpperCase(),
    }, ...r])
    setSubmitted(true)
    setOpen(false)
    setTimeout(() => { setSubmitted(false); setName(''); setMsg(''); setStars(5) }, 4000)
  }

  const inputBase: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12,
    color: '#f5f5f7', fontSize: 15, padding: '12px 16px',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ marginTop: 72 }}>
      {/* New user reviews rendered above the form button */}
      {reviews.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {reviews.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <TestimonialCard {...r} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Success toast */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            marginBottom: 24, padding: '14px 22px',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: 12, color: '#D4AF37',
            fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5">
            <path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/>
          </svg>
          Thanks for your review! It means everything to us.
        </motion.div>
      )}

      {/* Toggle button */}
      {!open ? (
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => setOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 980,
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.25)',
            color: '#D4AF37', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.14)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.08)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Leave a review
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pk-glass"
          style={{ borderRadius: 20, padding: '36px 32px', maxWidth: 560, margin: '0 auto', position: 'relative' }}
        >
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
            background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)',
          }} />

          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f5f5f7', marginBottom: 6, letterSpacing: '-0.025em' }}>
            Share your experience
          </h3>
          <p style={{ fontSize: 14, color: '#6e6e73', marginBottom: 28 }}>Your honest review helps others make great decisions.</p>

          {/* Star picker */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n}
                onClick={() => setStars(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s' }}
                onMouseDown={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.9)'}
                onMouseUp={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
              >
                <svg width="28" height="28" viewBox="0 0 24 24"
                  fill={(hovered || stars) >= n ? '#D4AF37' : 'rgba(255,255,255,0.1)'}
                  style={{ transition: 'fill 0.15s, filter 0.15s', filter: (hovered || stars) >= n ? 'drop-shadow(0 0 4px rgba(212,175,55,0.6))' : 'none' }}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
            <span style={{ fontSize: 13, color: '#6e6e73', alignSelf: 'center', marginLeft: 8 }}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][hovered || stars]}
            </span>
          </div>

          {/* Name field */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#6e6e73', fontWeight: 500, display: 'block', marginBottom: 6 }}>Your name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Priya S."
              style={inputBase}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(212,175,55,0.4)'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.09)'}
            />
          </div>

          {/* Message field */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: '#6e6e73', fontWeight: 500, display: 'block', marginBottom: 6 }}>Your review</label>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="How was your experience?"
              rows={4}
              style={{ ...inputBase, resize: 'none', lineHeight: 1.6 }}
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(212,175,55,0.4)'}
              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.09)'}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submit}
              disabled={!name.trim() || !msg.trim()}
              style={{
                flex: 1, height: 46, borderRadius: 12,
                background: !name.trim() || !msg.trim() ? 'rgba(212,175,55,0.25)' : 'linear-gradient(135deg, #D4AF37 0%, #C49A20 100%)',
                color: '#000', border: 'none', fontSize: 15, fontWeight: 700,
                cursor: !name.trim() || !msg.trim() ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              Post review
            </button>
            <button onClick={() => setOpen(false)} style={{
              height: 46, padding: '0 20px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#6e6e73', fontSize: 14, cursor: 'pointer',
              transition: 'color 0.2s',
            }}>
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const allProducts = useCatalogue()
  const featured = allProducts.slice(0, 4)

  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <CursorGlow />

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <div className="pk-grain" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Floating orbs */}
        <div className="orb-a" style={{
          position: 'absolute', top: '10%', left: '15%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)',
          pointerEvents: 'none', willChange: 'transform',
        }} />
        <div className="orb-b" style={{
          position: 'absolute', top: '30%', right: '8%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,60,220,0.13) 0%, transparent 70%)',
          pointerEvents: 'none', willChange: 'transform',
        }} />
        <div className="orb-c" style={{
          position: 'absolute', bottom: '5%', left: '40%',
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(60,120,255,0.10) 0%, transparent 70%)',
          pointerEvents: 'none', willChange: 'transform',
        }} />

        {/* Fade to black at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35vh',
          pointerEvents: 'none', zIndex: 2,
          background: 'linear-gradient(to bottom, transparent 0%, #000 100%)',
        }} />

        {/* ── HERO CONTENT ─────────────────────────────────── */}
        <div style={{
          position: 'relative', zIndex: 3,
          height: '100vh',
          minHeight: '-webkit-fill-available',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 24px 40px', boxSizing: 'border-box',
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
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#D4AF37', boxShadow: '0 0 6px rgba(212,175,55,0.8)',
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#D4AF37', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Seraph Group of Companies
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(42px, 7.5vw, 96px)',
              fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.0,
              color: '#f5f5f7', maxWidth: 980, marginBottom: 10,
            }}
          >
            Premium Subscriptions.
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(42px, 7.5vw, 96px)',
              fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.0,
              maxWidth: 980, marginBottom: 28,
            }}
          >
            <span className="pk-shimmer-text">Fraction of the price.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 18, fontWeight: 400, color: '#7a7a80', maxWidth: 500, lineHeight: 1.65, marginBottom: 40 }}
          >
            Netflix, Spotify, ChatGPT Plus &amp; more — up to{' '}
            <span style={{ color: '#f5f5f7', fontWeight: 600 }}>80% off</span>. Delivered to your WhatsApp in{' '}
            <span style={{ color: '#f5f5f7', fontWeight: 600 }}>under 5 minutes</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link href="/store" style={{
              textDecoration: 'none', height: 54, padding: '0 38px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #C49A20 100%)',
              color: '#000', borderRadius: 980, fontSize: 16, fontWeight: 700,
              letterSpacing: '-0.01em', transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(212,175,55,0.25)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.opacity = '0.9'; el.style.transform = 'scale(1.03)'
              el.style.boxShadow = '0 0 40px rgba(212,175,55,0.4)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.opacity = '1'; el.style.transform = 'scale(1)'
              el.style.boxShadow = '0 0 28px rgba(212,175,55,0.25)'
            }}
            >
              Explore Store
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>

            <a href="#how-it-works" style={{
              textDecoration: 'none', height: 54, padding: '0 38px',
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
              color: '#8a8a90', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 980, fontSize: 16, fontWeight: 500,
              transition: 'border-color 0.25s, color 0.25s, background 0.25s',
              display: 'inline-flex', alignItems: 'center',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(212,175,55,0.4)'; el.style.color = '#f5f5f7'; el.style.background = 'rgba(212,175,55,0.06)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(255,255,255,0.10)'; el.style.color = '#8a8a90'; el.style.background = 'rgba(255,255,255,0.05)' }}
            >
              How it works ↓
            </a>
          </motion.div>
        </div>

        {/* ── TICKER ─────────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <Ticker />
        </div>
      </div>

      {/* ── GOLD DIVIDER ──────────────────────────────────────── */}
      <hr className="pk-divider" />

      {/* ══════════════════════════════════════════════════
          TRUST STATS STRIP
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: '72px 24px 80px' }}>
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

      {/* ── GOLD DIVIDER ──────────────────────────────────────── */}
      <hr className="pk-divider" />

      {/* ══════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px 100px', maxWidth: 1080, margin: '0 auto' }}>

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
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(212,175,55,0.35)'; el.style.color = '#f5f5f7' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(255,255,255,0.09)'; el.style.color = '#8a8a90' }}
          >
            View all 9 subscriptions →
          </Link>
        </SectionReveal>
      </section>

      {/* ── GOLD DIVIDER ──────────────────────────────────────── */}
      <hr className="pk-divider" />

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 24px' }}>
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
                <div className="pk-hover" style={{
                  background: '#111',
                  borderRadius: 22, padding: '32px 28px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  height: '100%', position: 'relative', overflow: 'hidden',
                }}>
                  {/* corner glow */}
                  <div style={{
                    position: 'absolute', top: -40, right: -40,
                    width: 140, height: 140, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212,175,55,0.07), transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                  <StepIcon>{icon}</StepIcon>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#D4AF37', letterSpacing: '0.18em', marginBottom: 12, textTransform: 'uppercase' }}>{n}</p>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.025em', marginBottom: 12 }}>{title}</h3>
                  <p style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.65 }}>{body}</p>
                </div>
              </StaggerChild>
            ))}
          </StaggerReveal>

        </div>
      </section>

      {/* ── GOLD DIVIDER ──────────────────────────────────────── */}
      <hr className="pk-divider" />

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>

          <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
              What customers say
            </p>
            <h2 style={{
              fontSize: 'clamp(30px, 4.5vw, 50px)', fontWeight: 700,
              letterSpacing: '-0.04em', color: '#f5f5f7', marginBottom: 14,
            }}>
              Real people. Real savings.
            </h2>
            <p style={{ fontSize: 18, color: '#6e6e73' }}>
              Thousands of happy subscribers across India.
            </p>
          </SectionReveal>

          <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
            {TESTIMONIALS.map((t) => (
              <StaggerChild key={t.name}>
                <TestimonialCard {...t} />
              </StaggerChild>
            ))}
          </StaggerReveal>

          {/* ── LEAVE A REVIEW ─────────────────────────────────── */}
          <ReviewForm />

        </div>
      </section>

</main>
  )
}
