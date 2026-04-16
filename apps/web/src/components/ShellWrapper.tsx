'use client'
import { usePathname } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { MobileNav } from '@/components/mobile/MobileNav'
import Footer from '@/components/Footer'
import { PreloaderWrapper } from '@/components/PreloaderWrapper'
import { useState, useEffect } from 'react'

const NO_SHELL_ROUTES = ['/checkout']

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const bare = NO_SHELL_ROUTES.some(r => pathname.startsWith(r))
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (bare) {
    return <main>{children}</main>
  }

  return (
    <PreloaderWrapper>
      {isMobile ? <MobileNav /> : <Nav />}
      <main className="pt-[48px]">{children}</main>
      <Footer />
    </PreloaderWrapper>
  )
}
