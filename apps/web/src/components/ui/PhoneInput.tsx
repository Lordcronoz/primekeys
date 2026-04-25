'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useCurrency } from '@/context/CurrencyContext'

// ── Country data ────────────────────────────────────────────
export interface Country {
  name: string
  flag: string
  dial: string   // e.g. "+91"
  code: string   // ISO 2-letter, e.g. "IN"
}

export const COUNTRIES: Country[] = [
  { name: 'India',                flag: '🇮🇳', dial: '+91',  code: 'IN' },
  { name: 'United States',        flag: '🇺🇸', dial: '+1',   code: 'US' },
  { name: 'United Arab Emirates', flag: '🇦🇪', dial: '+971', code: 'AE' },
  { name: 'United Kingdom',       flag: '🇬🇧', dial: '+44',  code: 'GB' },
  { name: 'Australia',            flag: '🇦🇺', dial: '+61',  code: 'AU' },
  { name: 'Canada',               flag: '🇨🇦', dial: '+1',   code: 'CA' },
  { name: 'Singapore',            flag: '🇸🇬', dial: '+65',  code: 'SG' },
  { name: 'Malaysia',             flag: '🇲🇾', dial: '+60',  code: 'MY' },
  { name: 'Qatar',                flag: '🇶🇦', dial: '+974', code: 'QA' },
  { name: 'Saudi Arabia',         flag: '🇸🇦', dial: '+966', code: 'SA' },
  { name: 'Kuwait',               flag: '🇰🇼', dial: '+965', code: 'KW' },
  { name: 'Germany',              flag: '🇩🇪', dial: '+49',  code: 'DE' },
  { name: 'France',               flag: '🇫🇷', dial: '+33',  code: 'FR' },
  { name: 'Netherlands',          flag: '🇳🇱', dial: '+31',  code: 'NL' },
  { name: 'Pakistan',             flag: '🇵🇰', dial: '+92',  code: 'PK' },
  { name: 'Bangladesh',           flag: '🇧🇩', dial: '+880', code: 'BD' },
  { name: 'Sri Lanka',            flag: '🇱🇰', dial: '+94',  code: 'LK' },
  { name: 'Nepal',                flag: '🇳🇵', dial: '+977', code: 'NP' },
  { name: 'Philippines',          flag: '🇵🇭', dial: '+63',  code: 'PH' },
  { name: 'Indonesia',            flag: '🇮🇩', dial: '+62',  code: 'ID' },
  { name: 'Nigeria',              flag: '🇳🇬', dial: '+234', code: 'NG' },
  { name: 'Kenya',                flag: '🇰🇪', dial: '+254', code: 'KE' },
  { name: 'South Africa',         flag: '🇿🇦', dial: '+27',  code: 'ZA' },
  { name: 'New Zealand',          flag: '🇳🇿', dial: '+64',  code: 'NZ' },
  { name: 'Japan',                flag: '🇯🇵', dial: '+81',  code: 'JP' },
  { name: 'China',                flag: '🇨🇳', dial: '+86',  code: 'CN' },
]

// ── Currency → country code mapping ────────────────────────
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  INR: 'IN',
  USD: 'US',
  AED: 'AE',
  GBP: 'GB',
  AUD: 'AU',
  CAD: 'CA',
  SGD: 'SG',
  MYR: 'MY',
  QAR: 'QA',
  SAR: 'SA',
  KWD: 'KW',
  EUR: 'DE',
}

function findCountry(code: string) {
  return COUNTRIES.find(c => c.code === code) ?? COUNTRIES[0]
}

// ── Component ───────────────────────────────────────────────
interface PhoneInputProps {
  value: string
  onChange: (fullPhone: string) => void
  placeholder?: string
  required?: boolean
}

export function PhoneInput({ value, onChange, placeholder = 'Phone number', required }: PhoneInputProps) {
  const { currencyCode } = useCurrency()
  const defaultCode = CURRENCY_TO_COUNTRY[currencyCode] ?? 'IN'

  const [country, setCountry]   = useState<Country>(() => findCountry(defaultCode))
  const [number, setNumber]     = useState('')
  const [open, setOpen]         = useState(false)
  const [search, setSearch]     = useState('')
  const dropRef                 = useRef<HTMLDivElement>(null)
  const searchRef               = useRef<HTMLInputElement>(null)

  // Auto-update country when currency changes (only if user hasn't manually chosen)
  const [manuallySet, setManuallySet] = useState(false)
  useEffect(() => {
    if (!manuallySet) {
      setCountry(findCountry(CURRENCY_TO_COUNTRY[currencyCode] ?? 'IN'))
    }
  }, [currencyCode, manuallySet])

  // Sync outward value whenever dial or number changes
  useEffect(() => {
    const full = number.trim() ? `${country.dial} ${number.trim()}` : ''
    onChange(full)
  }, [country.dial, number]) // eslint-disable-line react-hooks/exhaustive-deps

  // Parse inbound value if pre-filled (e.g. from user profile)
  useEffect(() => {
    if (!value) return
    const matched = COUNTRIES.find(c => value.startsWith(c.dial))
    if (matched) {
      setCountry(matched)
      setNumber(value.slice(matched.dial.length).trim())
    } else {
      setNumber(value)
    }
  }, []) // run once on mount

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false); setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const selectCountry = useCallback((c: Country) => {
    setCountry(c)
    setManuallySet(true)
    setOpen(false)
    setSearch('')
  }, [])

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
        onBlurCapture={e => {
          if (!dropRef.current?.contains(e.relatedTarget as Node))
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
        }}
      >
        {/* Flag + dial code trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 10px 0 12px', height: 42, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{country.flag}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#D4AF37', letterSpacing: '0.02em' }}>
            {country.dial}
          </span>
          {/* chevron */}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5">
            <path d={open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Number input */}
        <input
          type="tel"
          inputMode="numeric"
          placeholder={placeholder}
          required={required}
          value={number}
          onChange={e => setNumber(e.target.value.replace(/[^\d\s\-]/g, ''))}
          style={{
            flex: 1, height: 42, padding: '0 14px',
            background: 'transparent', border: 'none', outline: 'none',
            color: '#f5f5f7', fontSize: 14, fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 999,
          background: 'rgba(18,18,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          maxHeight: 280,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Search */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', height: 34, padding: '0 10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 7, outline: 'none',
                color: '#f5f5f7', fontSize: 13, fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <p style={{ padding: '14px 14px', fontSize: 13, color: '#555', textAlign: 'center' }}>
                No results
              </p>
            ) : filtered.map(c => (
              <button
                key={c.code + c.dial}
                type="button"
                onClick={() => selectCountry(c)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', border: 'none', cursor: 'pointer',
                  background: country.code === c.code ? 'rgba(212,175,55,0.08)' : 'transparent',
                  textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = country.code === c.code ? 'rgba(212,175,55,0.08)' : 'transparent')}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{c.flag}</span>
                <span style={{ fontSize: 13, color: '#f5f5f7', flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: '#D4AF37', fontWeight: 600, flexShrink: 0 }}>{c.dial}</span>
                {country.code === c.code && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
