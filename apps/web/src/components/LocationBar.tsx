'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { REGIONS, CURRENCIES } from '@primekeys/shared'
import { useState, useRef, useEffect } from 'react'

export function LocationBar() {
  const { region, currencyCode, setRegion, loading } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) return null

  const activeRegion = REGIONS.find(r => r.code === region) || REGIONS[0]
  const activeCurrencyInfo = CURRENCIES[currencyCode]

  return (
    <div className="bg-[#0c0c0c] border-b border-[rgba(255,255,255,0.03)] py-1.5 text-xs text-[#999999] relative z-40 mt-[var(--nav-h)] pl-4 pr-4 flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#2dcc6e] animate-pulse-dot"></span>
        <span>Delivery within 5 minutes</span>
      </div>
      
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <span>{activeCurrencyInfo?.flag}</span>
          <span>{activeRegion.name}</span>
          <span>({currencyCode})</span>
          <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 max-h-64 overflow-y-auto overflow-x-hidden bg-[#141414] border border-[rgba(255,255,255,0.05)] rounded-xl shadow-2xl py-1 z-50">
            {REGIONS.map((r) => {
              const rCur = require('@primekeys/shared').REGION_TO_CURRENCY[r.code] || 'INR'
              const rFlag = CURRENCIES[rCur]?.flag
              return (
                <button
                  key={r.code}
                  onClick={() => {
                    setRegion(r.code)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-[#1c1c1c] transition-colors ${
                    region === r.code ? 'text-[#D4AF37] bg-[rgba(212,175,55,0.05)]' : 'text-[#f0f0f0]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{rFlag}</span>
                    <span>{r.name}</span>
                  </div>
                  <span className="text-[10px] opacity-60 text-right">{rCur}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
