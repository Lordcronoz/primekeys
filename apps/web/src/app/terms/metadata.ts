import type { Metadata } from 'next'

const BASE_URL = 'https://www.primekeys.app'

export const metadata: Metadata = {
  title: 'Terms of Use | PRIMEKEYS',
  description:
    'Read the PRIMEKEYS Terms of Use. Understand your rights and obligations when purchasing digital subscriptions from us.',
  alternates: { canonical: `${BASE_URL}/terms` },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Terms of Use | PRIMEKEYS',
    description:
      'Read the PRIMEKEYS Terms of Use. Understand the rules that apply to purchasing digital subscriptions from our platform.',
    url: `${BASE_URL}/terms`,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS Terms of Use',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Use | PRIMEKEYS',
    description: 'Understand your rights and obligations when purchasing digital subscriptions from PRIMEKEYS.',
    images: [`${BASE_URL}/opengraph-image`],
  },
}
