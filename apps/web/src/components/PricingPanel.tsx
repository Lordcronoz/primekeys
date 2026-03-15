'use client'

import { useState } from 'react'
import { DURATIONS, calcPrice, formatPrice, PRODUCTS } from '@primekeys/shared'
import { useCurrency } from '@/context/CurrencyContext'
import { useRouter } from 'next/navigation'

interface PricingPanelProps {
  product: typeof PRODUCTS[0]
}

export function PricingPanel({ product }: PricingPanelProps) {
  const { currencyCode } = useCurrency()
  const router = useRouter()
  const [selectedMonths, setSelectedMonths] = useState<number>(3)

  const totalPrice = calcPrice(product.baseINR, selectedMonths, currencyCode).total

  return (
    <div style={{
      background: '#1d1d1f',
      borderRadius: 20,
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      <h3 style={{
        fontSize: 21,
        fontWeight: 600,
        color: '#f5f5f7',
        letterSpacing: '-0.02em',
        marginBottom: 6,
      }}>
        Choose your plan.
      </h3>
      <p style={{ fontSize: 14, color: '#a1a1a6', marginBottom: 24 }}>
        Longer plans = more savings.
      </p>

      {/* Duration options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {DURATIONS.map(dur => {
          const pricing = calcPrice(product.baseINR, dur.months, currencyCode)
          const sel = selectedMonths === dur.months

          return (
            <button
              key={dur.months}
              onClick={() => setSelectedMonths(dur.months)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 12,
                border: sel ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                background: sel ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: sel ? '#f5f5f7' : '#a1a1a6',
                  }}>
                    {dur.label}
                  </span>
                  {dur.saveLabel && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#D4AF37',
                      background: 'rgba(212,175,55,0.12)',
                      padding: '2px 7px',
                      borderRadius: 4,
                      letterSpacing: '0.05em',
                    }}>
                      {dur.saveLabel}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: '#6e6e73' }}>
                  {formatPrice(pricing.perMonth, currencyCode)}/mo
                </span>
              </div>
              <span style={{
                fontSize: 17,
                fontWeight: 700,
                color: sel ? '#f5f5f7' : '#a1a1a6',
              }}>
                {formatPrice(pricing.total, currencyCode)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Total */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 20,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 14, color: '#a1a1a6' }}>Total today</span>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>
          {totalPrice}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push(`/checkout?product=${product.id}&months=${selectedMonths}`)}
        style={{
          width: '100%',
          height: 50,
          background: '#D4AF37',
          color: '#000',
          border: 'none',
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '-0.01em',
          marginBottom: 12,
        }}
      >
        Buy Now
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#6e6e73' }}>
        Delivered to WhatsApp within 5 minutes. 100% guaranteed.
      </p>
    </div>
  )
}
