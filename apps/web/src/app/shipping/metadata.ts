import type { Metadata } from 'next'

const BASE_URL = 'https://www.primekeys.app'

export const metadata: Metadata = {
  title: 'Shipping Policy | PRIMEKEYS',
  description:
    'PRIMEKEYS delivers all digital subscriptions via WhatsApp in under 5 minutes. No physical shipping. Worldwide digital delivery.',
  alternates: { canonical: `${BASE_URL}/shipping` },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Shipping Policy | PRIMEKEYS',
    description:
      'PRIMEKEYS delivers all digital subscription credentials via WhatsApp in under 5 minutes. No physical products, no postal shipping.',
    url: `${BASE_URL}/shipping`,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS Shipping Policy — Digital delivery worldwide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping Policy | PRIMEKEYS',
    description: 'PRIMEKEYS delivers all digital subscriptions via WhatsApp in under 5 minutes. Worldwide digital delivery.',
    images: [`${BASE_URL}/opengraph-image`],
  },
}
