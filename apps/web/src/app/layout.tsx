import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { MaintenanceGate } from '@/components/ui/MaintenanceGate'
import { ShellWrapper } from '@/components/ShellWrapper'

export const metadata: Metadata = {
  title: 'PRIMEKEYS — Netflix, Spotify & More at 80% Off | India',
  description: 'Buy Netflix, Spotify, ChatGPT Plus, Disney+, YouTube Premium subscriptions at up to 80% off. Delivered to your WhatsApp in under 5 minutes. Trusted by 500+ customers in India.',
  keywords: [
    'cheap Netflix subscription India', 'Spotify premium cheap India',
    'ChatGPT Plus cheap', 'buy Netflix account India', 'premium subscriptions India',
    'Netflix 4K cheap India', 'YouTube Premium India cheap', 'PRIMEKEYS',
    'premium digital subscriptions', 'affordable streaming subscriptions',
  ].join(', '),
  metadataBase: new URL('https://primekeys.app'),
  alternates: { canonical: 'https://primekeys.app' },
  openGraph: {
    title: 'PRIMEKEYS — Premium Subscriptions at 80% Off',
    description: 'Netflix, Spotify, ChatGPT & more delivered to your WhatsApp in under 5 minutes.',
    url: 'https://primekeys.app',
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PRIMEKEYS — Premium Subscriptions at 80% Off',
    description: 'Netflix, Spotify, ChatGPT & more delivered to your WhatsApp in under 5 minutes.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="pk-cursor" />
        <div id="pk-cursor-ring" />
        <AuthProvider>
          <CurrencyProvider>
            <MaintenanceGate>
              <ShellWrapper>{children}</ShellWrapper>
            </MaintenanceGate>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}