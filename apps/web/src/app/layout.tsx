import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { Nav } from '@/components/Nav'
import { PreloaderWrapper } from '@/components/PreloaderWrapper'
import Footer from '@/components/Footer'
import { MaintenanceBanner } from '@/components/ui/MaintenanceBanner'

export const metadata: Metadata = {
  title: 'PRIMEKEYS — Premium Subscriptions',
  description: 'Netflix, Spotify, ChatGPT and more at 70–80% off official prices. Delivered within 5 minutes.',
  keywords: 'Netflix subscription, Spotify premium, ChatGPT Plus, Disney+ Hotstar, cheap subscriptions India',
  openGraph: {
    title: 'PRIMEKEYS — Premium Subscriptions',
    description: 'Netflix, Spotify, ChatGPT and more at 70–80% off official prices.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div id="pk-cursor" />
        <div id="pk-cursor-ring" />
        <AuthProvider>
          <CurrencyProvider>
            <PreloaderWrapper>
              <Nav />
              <MaintenanceBanner />
              <main className="pt-[48px]">
                {children}
              </main>
              <Footer />
            </PreloaderWrapper>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}