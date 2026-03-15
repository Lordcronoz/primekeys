'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { REGIONS, REGION_TO_CURRENCY } from '@primekeys/shared'

interface CurrencyContextType {
  region: string
  currencyCode: string
  setRegion: (region: string) => void
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType>({} as CurrencyContextType)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<string>('IN')
  const [currencyCode, setCurrencyCode] = useState<string>('INR')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function detectLocation() {
      try {
        const stored = localStorage.getItem('pk_region')
        if (stored && REGIONS.find(r => r.code === stored)) {
          setRegion(stored)
          setLoading(false)
          return
        }
        
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data.country && REGIONS.find(r => r.code === data.country)) {
          setRegion(data.country)
        } else {
          setRegion('IN')
        }
      } catch (error) {
        setRegion('IN')
      } finally {
        setLoading(false)
      }
    }
    
    detectLocation()
  }, [])

  const setRegion = (newRegion: string) => {
    setRegionState(newRegion)
    const newCurr = REGION_TO_CURRENCY[newRegion] || 'INR'
    setCurrencyCode(newCurr)
    localStorage.setItem('pk_region', newRegion)
  }

  return (
    <CurrencyContext.Provider value={{ region, currencyCode, setRegion, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
