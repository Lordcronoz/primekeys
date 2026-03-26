import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { MaintenanceGate } from '@/components/ui/MaintenanceGate'
import { ShellWrapper } from '@/components/ShellWrapper'

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