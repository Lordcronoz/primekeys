"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const GREETINGS = [
  { word: "Hello",       lang: "English"    },
  { word: "नमस्ते",      lang: "Hindi"      },
  { word: "Hola",        lang: "Spanish"    },
  { word: "こんにちは",   lang: "Japanese"   },
  { word: "Bonjour",     lang: "French"     },
  { word: "مرحباً",      lang: "Arabic"     },
  { word: "안녕하세요",   lang: "Korean"     },
  { word: "Ciao",        lang: "Italian"    },
  { word: "வணக்கம்",     lang: "Tamil"      },
  { word: "Olá",         lang: "Portuguese" },
  { word: "PRIMEKEYS",   lang: ""           },
]

// Timing — first word lingers, middle words quick, last lingers before exit
const DELAYS = GREETINGS.map((_, i) => {
  if (i === 0) return 900
  if (i === GREETINGS.length - 1) return 0  // handled by exit timeout
  return 180
})

const slideUp = {
  initial: { y: 0 },
  exit: {
    y: "-100vh",
    transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] as const, delay: 0.1 },
  },
}

export default function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [index,     setIndex]   = useState(0)
  const [dim,       setDim]     = useState({ w: 0, h: 0 })
  const [isExiting, setExiting] = useState(false)

  useEffect(() => {
    setDim({ w: window.innerWidth, h: window.innerHeight })
    document.documentElement.classList.add('preloader-active')
    return () => {
      document.documentElement.classList.remove('preloader-active')
    }
  }, [])

  useEffect(() => {
    if (index === GREETINGS.length - 1) {
      const t1 = setTimeout(() => setExiting(true), 1000)
      const t2 = setTimeout(() => onComplete?.(), 2000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    const t = setTimeout(() => setIndex(i => i + 1), DELAYS[index])
    return () => clearTimeout(t)
  }, [index, onComplete])

  const isFinal  = index === GREETINGS.length - 1
  const progress = ((index + 1) / GREETINGS.length) * 100

  const initPath = dim.w ? `M0 0 L${dim.w} 0 L${dim.w} ${dim.h} Q${dim.w/2} ${dim.h+300} 0 ${dim.h} L0 0` : ''
  const targPath = dim.w ? `M0 0 L${dim.w} 0 L${dim.w} ${dim.h} Q${dim.w/2} ${dim.h} 0 ${dim.h} L0 0` : ''

  const curve = {
    initial: { d: initPath, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const } },
    exit:    { d: targPath, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: 0.2 } },
  }

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate={isExiting ? "exit" : "initial"}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#060606',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #C49A20, #D4AF37)', borderRadius: 2 }}
        />
      </div>

      {dim.w > 0 && (
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 32px' }}>

          {/* Language label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`lang-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.35, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#D4AF37',
                marginBottom: 18, minHeight: 14,
              }}
            >
              {GREETINGS[index].lang}
            </motion.p>
          </AnimatePresence>

          {/* Word row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>

            {/* Gold dot */}
            <motion.span
              animate={isFinal
                ? { scale: [1, 1.6, 1], boxShadow: ['0 0 10px rgba(212,175,55,0.4)', '0 0 24px rgba(212,175,55,0.8)', '0 0 10px rgba(212,175,55,0.4)'] }
                : { scale: 1 }
              }
              transition={isFinal ? { duration: 0.8, times: [0, 0.5, 1] } : {}}
              style={{
                display: 'block', width: 10, height: 10, flexShrink: 0,
                background: '#D4AF37', borderRadius: '50%',
                boxShadow: '0 0 10px rgba(212,175,55,0.4)',
              }}
            />

            <AnimatePresence mode="wait">
              <motion.span
                key={`word-${index}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(38px, 7vw, 82px)',
                  fontWeight: isFinal ? 800 : 700,
                  letterSpacing: isFinal ? '-0.05em' : '-0.02em',
                  lineHeight: 1.05,
                  userSelect: 'none',
                }}
              >
                {isFinal ? (
                  <>
                    <span style={{ color: '#D4AF37' }}>PRIME</span>
                    <span style={{ color: '#ffffff' }}>KEYS</span>
                  </>
                ) : (
                  <span style={{ color: '#f5f5f7' }}>{GREETINGS[index].word}</span>
                )}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Curved SVG wipe */}
      {dim.w > 0 && (
        <svg style={{ position: 'absolute', top: 0, width: '100%', height: 'calc(100% + 300px)', pointerEvents: 'none' }}>
          <motion.path
            variants={curve}
            initial="initial"
            animate={isExiting ? "exit" : "initial"}
            fill="#060606"
          />
        </svg>
      )}
    </motion.div>
  )
}