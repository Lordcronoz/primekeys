"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const words = ["Hello", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "Guten tag", "হ্যালো"]

const opacityVariant = {
  initial: { opacity: 0 },
  enter: { opacity: 0.85, transition: { duration: 0.8, delay: 0.2 } },
}

const slideUp = {
  initial: { top: 0 },
  exit: {
    top: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: 0.2 },
  },
}

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex] = useState(0)
  const [dimension, setDimension] = useState({ width: 0, height: 0 })
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    if (index === words.length - 1) {
      setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => { onComplete?.() }, 1000)
      }, 800)
      return
    }
    setTimeout(() => setIndex(i => i + 1), index === 0 ? 800 : 130)
  }, [index, onComplete])

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`
  const targetPath  = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`

  const curve = {
    initial: { d: initialPath, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const } },
    exit:    { d: targetPath,  transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.3 } },
  }

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate={isExiting ? "exit" : "initial"}
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#000', zIndex: 99999,
      }}
    >
      {dimension.width > 0 && (
        <>
          <motion.p
            variants={opacityVariant}
            initial="initial"
            animate="enter"
            style={{
              display: 'flex', alignItems: 'center',
              color: '#f5f5f7',
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 700, letterSpacing: '-0.04em',
              position: 'absolute', zIndex: 10,
              fontFamily: 'inherit',
            }}
          >
            <span style={{
              display: 'block', width: 10, height: 10,
              background: '#D4AF37',
              borderRadius: '50%', marginRight: 16,
            }} />
            {words[index]}
          </motion.p>

          <svg
            style={{ position: 'absolute', top: 0, width: '100%', height: 'calc(100% + 300px)' }}
          >
            <motion.path
              variants={curve}
              initial="initial"
              animate={isExiting ? "exit" : "initial"}
              fill="#000"
            />
          </svg>
        </>
      )}
    </motion.div>
  )
}