'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >

        {/* Error badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 16 }}
        >
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: '#D4AF37',
            padding: '4px 14px', borderRadius: 999,
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}>
            Error 404
          </span>
        </motion.div>

        {/* 4 👻 4 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}
        >
          {/* Left 4 */}
          <span style={{
            fontSize: 'clamp(80px, 18vw, 150px)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #D4AF37, #C49A20)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>4</span>

          {/* Ghost */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Shadow under ghost */}
            <motion.div
              animate={{ scaleX: [1, 0.7, 1], opacity: [0.4, 0.15, 0.4] }}
              transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
              style={{
                position: 'absolute',
                bottom: -8,
                width: 60,
                height: 12,
                borderRadius: '50%',
                background: 'rgba(212,175,55,0.35)',
                filter: 'blur(6px)',
              }}
            />

            <svg
              width="110"
              height="130"
              viewBox="0 0 100 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F0CC55" />
                  <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
                <linearGradient id="ghostGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFE066" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Ghost glow layer */}
              <path
                d="M50 5 C25 5 10 22 10 45 L10 105 L22 95 L34 105 L46 95 L50 105 L54 95 L66 105 L78 95 L90 105 L90 45 C90 22 75 5 50 5 Z"
                fill="url(#ghostGlow)"
                transform="scale(1.05) translate(-2.5, -2.5)"
              />

              {/* Ghost body */}
              <path
                d="M50 5 C25 5 10 22 10 45 L10 105 L22 95 L34 105 L46 95 L50 105 L54 95 L66 105 L78 95 L90 105 L90 45 C90 22 75 5 50 5 Z"
                fill="url(#ghostGrad)"
                filter="url(#glow)"
                opacity="0.95"
              />

              {/* Inner sheen */}
              <ellipse cx="40" cy="30" rx="14" ry="10" fill="rgba(255,255,255,0.12)" />

              {/* Left eye */}
              <circle cx="37" cy="50" r="7" fill="#1a0f00" />
              <circle cx="37" cy="50" r="4" fill="#000" />
              <circle cx="39.5" cy="47.5" r="2" fill="#fff" opacity="0.9" />

              {/* Right eye */}
              <circle cx="63" cy="50" r="7" fill="#1a0f00" />
              <circle cx="63" cy="50" r="4" fill="#000" />
              <circle cx="65.5" cy="47.5" r="2" fill="#fff" opacity="0.9" />

              {/* Smile */}
              <path
                d="M40 64 Q50 74 60 64"
                stroke="#1a0f00"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />

              {/* Crown */}
              <path
                d="M32 12 L38 4 L44 10 L50 2 L56 10 L62 4 L68 12"
                stroke="#FFE066"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.9"
              />
            </svg>
          </motion.div>

          {/* Right 4 */}
          <span style={{
            fontSize: 'clamp(80px, 18vw, 150px)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #D4AF37, #C49A20)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>4</span>
        </motion.div>

        {/* Heading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#f0f0f0',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}
        >
          This page doesn't exist.
        </motion.p>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.35)',
            marginBottom: 40,
            maxWidth: 320,
            lineHeight: 1.6,
            margin: '0 auto 40px',
          }}
        >
          The page you're looking for has been moved, deleted, or never existed.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 46, padding: '0 24px',
            background: 'linear-gradient(135deg, #D4AF37, #C49A20)',
            color: '#000', borderRadius: 12,
            fontSize: 14, fontWeight: 700,
            textDecoration: 'none',
          }}>
            <Home size={15} /> Go Home
          </Link>

          <Link href="/store" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 46, padding: '0 24px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)', borderRadius: 12,
            fontSize: 14, fontWeight: 600,
            textDecoration: 'none',
          }}>
            <ShoppingBag size={15} /> Browse Store
          </Link>
        </motion.div>

        {/* PRIMEKEYS branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          style={{ marginTop: 60 }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.02em' }}>PRIME</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>KEYS</span>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
            SERAPH GROUP OF COMPANIES
          </p>
        </motion.div>

      </motion.div>
    </div>
  )
}