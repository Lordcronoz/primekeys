'use client'

import { useState, useCallback, useEffect } from 'react'
import Preloader from '@/components/ui/preloader'

export function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(true) // default true = don't show

  useEffect(() => {
    // Only show if not seen this session
    const seen = sessionStorage.getItem('pk_preloader_seen')
    if (!seen) setDone(false)
  }, [])

  const handleComplete = useCallback(() => {
    sessionStorage.setItem('pk_preloader_seen', '1')
    setDone(true)
  }, [])

  return (
    <>
      {!done && <Preloader onComplete={handleComplete} />}
      {children}
    </>
  )
}