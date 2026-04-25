import type { Metadata } from 'next'

const BASE_URL = 'https://www.primekeys.app'

export const metadata: Metadata = {
  title: 'Privacy Policy | PRIMEKEYS',
  description:
    'Read the PRIMEKEYS Privacy Policy. Learn how we collect, use, and protect your personal data when you buy digital subscriptions from us.',
  alternates: { canonical: `${BASE_URL}/privacy` },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Privacy Policy | PRIMEKEYS',
    description:
      'Learn how PRIMEKEYS handles your personal data, what we collect, and your rights as a customer.',
    url: `${BASE_URL}/privacy`,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | PRIMEKEYS',
    description: 'Learn how PRIMEKEYS handles your personal data and your rights as a customer.',
    images: [`${BASE_URL}/opengraph-image`],
  },
}
