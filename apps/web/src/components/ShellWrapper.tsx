'use client'
import { usePathname } from 'next/navigation'
import { Nav } from '@/components/Nav'
import Footer from '@/components/Footer'
import { PreloaderWrapper } from '@/components/PreloaderWrapper'

const NO_SHELL_ROUTES = ['/checkout']

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const bare = NO_SHELL_ROUTES.some(r => pathname.startsWith(r))

  if (bare) {
    return <main>{children}</main>
  }

  return (
    <PreloaderWrapper>
      <Nav />
      <main className="pt-[48px]">{children}</main>
      <Footer />
    </PreloaderWrapper>
  )
}
