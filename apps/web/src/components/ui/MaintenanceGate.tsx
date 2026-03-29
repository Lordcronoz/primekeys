'use client'

import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { MessageCircle, ArrowRight, Wrench } from 'lucide-react'

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  const [checked, setChecked] = useState(false)
  const [bypass, setBypass] = useState(false)
  const [dots, setDots] = useState('.')

  useEffect(() => {
    return onSnapshot(doc(db, 'maintenance', '_banner'), snap => {
      setActive(snap.exists() ? (snap.data().active ?? false) : false)
      setChecked(true)
    }, () => setChecked(true))
  }, [])

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 600)
    return () => clearInterval(id)
  }, [])

  if (!checked) return null
  if (!active || bypass) return <>{children}</>

  const waLink = `https://wa.me/918111956481?text=${encodeURIComponent('Hi! I\'d like to be notified when PRIMEKEYS is back online. Please let me know!')}`

  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />

      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.04, backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>
            <span style={{ color: '#D4AF37' }}>PRIME</span>
            <span style={{ color: '#f5f5f7' }}>KEYS</span>
          </span>
        </div>

        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', animation: 'pulse 2s ease-in-out infinite' }}>
          <Wrench size={36} color="#D4AF37" />
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
          We'll be right<br />
          <span style={{ color: '#D4AF37' }}>back{dots}</span>
        </h1>

        <p style={{ fontSize: 16, color: '#6e6e73', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 12px' }}>
          PRIMEKEYS is currently undergoing scheduled maintenance to improve your experience.
        </p>
        <p style={{ fontSize: 14, color: '#444', marginBottom: 48 }}>
          Sit tight — we'll be back shortly.
        </p>

        {/* Status indicator */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 980, marginBottom: 40 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.8)', animation: 'ping 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24', letterSpacing: '0.08em' }}>MAINTENANCE IN PROGRESS</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 48 }}>
          <a href={waLink} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            height: 54, padding: '0 32px', borderRadius: 16,
            background: 'linear-gradient(135deg, #D4AF37, #C49A20)',
            color: '#000', textDecoration: 'none',
            fontSize: 15, fontWeight: 700,
            boxShadow: '0 0 24px rgba(212,175,55,0.2)',
            transition: 'opacity 0.2s, transform 0.15s',
            width: '100%', maxWidth: 340, justifyContent: 'center',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity='0.9'; el.style.transform='scale(1.02)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity='1'; el.style.transform='scale(1)' }}>
            <MessageCircle size={19} />
            Notify me when back
          </a>

          <button onClick={() => setBypass(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 48, padding: '0 28px', borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#6e6e73', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s',
            width: '100%', maxWidth: 340, justifyContent: 'center',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color='#f5f5f7'; el.style.borderColor='rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color='#6e6e73'; el.style.borderColor='rgba(255,255,255,0.08)' }}>
            Continue to site anyway
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: '#333', marginBottom: 8 }}>Follow us for updates</p>
          <a href="https://instagram.com/primekeys_offical" target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>
            @primekeys_offical
          </a>
          <p style={{ fontSize: 11, color: '#2a2a2e', marginTop: 20 }}>
            © {new Date().getFullYear()} PRIMEKEYS · An S&M Holdings Concern
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55,0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(212,175,55,0); }
        }
        @keyframes ping {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}