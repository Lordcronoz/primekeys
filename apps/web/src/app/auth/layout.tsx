import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | PRIMEKEYS',
  description: 'Sign in to your PRIMEKEYS account to manage your digital subscriptions.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: 'https://www.primekeys.app/auth' },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
