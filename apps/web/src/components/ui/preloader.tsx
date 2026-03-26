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

const slideUp = {
  initial: { top: 0 },
  exit: {
    top: "-100vh",
    transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] as const, delay: 0.15 },
  },
}

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex]       = useState(0)
  const [dim, setDim]           = useState({ w: 0, h: 0 })
  const [isExiting, setExiting] = useState(false)

  useEffect(() => {
    setDim({ w: window.innerWidth, h: window.innerHeight })
  }, [])

  // Advance words
  useEffect(() => {
    if (index === GREETINGS.length - 1) {
      const t1 = setTimeout(() => setExiting(true), 900)
      const t2 = setTimeout(() => onComplete?.(), 1900)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    const delay = index === 0 ? 700 : 160
    const t = setTimeout(() => setIndex(i => i + 1), delay)
    return () => clearTimeout(t)
  }, [index, onComplete])

  const initPath = `M0 0 L${dim.w} 0 L${dim.w} ${dim.h} Q${dim.w / 2} ${dim.h + 300} 0 ${dim.h} L0 0`
  const targPath = `M0 0 L${dim.w} 0 L${dim.w} ${dim.h} Q${dim.w / 2} ${dim.h} 0 ${dim.h} L0 0`

  const curve = {
    initial: { d: initPath, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const } },
    exit:    { d: targPath, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.25 } },
  }

  const isFinal = index === GREETINGS.length - 1
  const progress = ((index + 1) / GREETINGS.length) * 100

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
      }}
    >
      {/* Bottom progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'rgba(255,255,255,0.05)',
      }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          style={{ height: '100%', background: '#D4AF37', borderRadius: 2 }}
        />
      </div>

      {dim.w > 0 && (
        <>
          {/* Word + language label */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>

            {/* Language label */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`lang-${index}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.3, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#D4AF37',
                  marginBottom: 16, fontFamily: 'inherit',
                  minHeight: 16,
                }}
              >
                {GREETINGS[index].lang}
              </motion.p>
            </AnimatePresence>

            {/* Main word */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              {/* Gold dot — pulses on final word */}
              <motion.span
                animate={isFinal
                  ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }
                  : { scale: 1 }
                }
                transition={isFinal ? { duration: 0.6, repeat: 1 } : {}}
                style={{
                  display: 'block', width: 10, height: 10, flexShrink: 0,
                  background: '#D4AF37', borderRadius: '50%',
                  boxShadow: '0 0 12px rgba(212,175,55,0.5)',
                }}
              />

              <AnimatePresence mode="wait">
                <motion.span
                  key={`word-${index}`}
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontSize: 'clamp(40px, 7vw, 80px)',
                    fontWeight: isFinal ? 800 : 700,
                    letterSpacing: isFinal ? '-0.04em' : '-0.02em',
                    color: isFinal ? '#D4AF37' : '#f5f5f7',
                    fontFamily: 'inherit',
                    lineHeight: 1,
                  }}
                >
                  {isFinal
                    ? <><span style={{ color: '#D4AF37' }}>PRIME</span><span style={{ color: '#fff' }}>KEYS</span></>
                    : GREETINGS[index].word
                  }
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Curved SVG wipe on exit */}
          <svg style={{ position: 'absolute', top: 0, width: '100%', height: 'calc(100% + 300px)', pointerEvents: 'none' }}>
            <motion.path
              variants={curve}
              initial="initial"
              animate={isExiting ? "exit" : "initial"}
              fill="#060606"
            />
          </svg>
        </>
      )}
    </motion.div>
  )
}