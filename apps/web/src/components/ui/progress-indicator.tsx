'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CircleCheck } from 'lucide-react'

interface ProgressIndicatorProps {
  step: 1 | 2 | 3
  onContinue?: () => void
  onBack?: () => void
  loading?: boolean
  continueLabel?: string
  showButtons?: boolean
}

const ProgressIndicator = ({
  step,
  onContinue,
  onBack,
  loading = false,
  continueLabel,
  showButtons = true,
}: ProgressIndicatorProps) => {
  const isExpanded = step === 1
  const labels = ['Details', 'Payment', 'Done']

  // Pill width tracks across the 3 dots (each dot ~8px, gap ~24px)
  const pillWidths = { 1: '24px', 2: '60px', 3: '96px' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      {/* Dots + animated pill */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: dot <= step ? '#f5f5f7' : 'rgba(255,255,255,0.2)',
                position: 'relative', zIndex: 10,
                transition: 'background 0.3s',
              }}
            />
          ))}

          {/* Gold progress pill */}
          <motion.div
            initial={{ width: '24px' }}
            animate={{ width: pillWidths[step] }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.8 }}
            style={{
              position: 'absolute',
              left: -8, top: '50%', transform: 'translateY(-50%)',
              height: 12,
              background: 'linear-gradient(90deg, #D4AF37, #C49A20)',
              borderRadius: 980,
              boxShadow: '0 0 12px rgba(212,175,55,0.4)',
              zIndex: 5,
            }}
          />
        </div>

        {/* Step labels */}
        <div style={{ display: 'flex', gap: 24 }}>
          {labels.map((label, i) => {
            const s = i + 1
            return (
              <span key={label} style={{
                fontSize: 10, fontWeight: step === s ? 600 : 400,
                color: step === s ? '#D4AF37' : step > s ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.25)',
                letterSpacing: '0.03em',
                width: 8, textAlign: 'center', whiteSpace: 'nowrap',
                transition: 'color 0.3s',
              }}>
                {label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Animated Back/Continue buttons (optional) */}
      {showButtons && (
        <div style={{ width: '100%', maxWidth: 360 }}>
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            animate={{ justifyContent: isExpanded ? 'stretch' : 'space-between' }}
          >
            {!isExpanded && (
              <motion.button
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: 64, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, mass: 0.8 }}
                onClick={onBack}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 980, color: '#a1a1a6',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Back
              </motion.button>
            )}
            <motion.button
              onClick={onContinue}
              disabled={loading}
              animate={{ flex: isExpanded ? 1 : 0 }}
              style={{
                padding: '12px 24px',
                background: loading
                  ? 'rgba(212,175,55,0.35)'
                  : 'linear-gradient(135deg, #D4AF37, #C49A20)',
                border: 'none', borderRadius: 980,
                color: '#000', fontWeight: 700, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                flex: isExpanded ? 1 : undefined,
                minWidth: isExpanded ? undefined : 176,
              }}
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <>
                  {step === 3 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <CircleCheck size={16} />
                    </motion.div>
                  )}
                  {continueLabel ?? (step === 3 ? 'Finish' : 'Continue')}
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ProgressIndicator
