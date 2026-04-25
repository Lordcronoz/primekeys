import type { Metadata } from 'next'

const BASE_URL = 'https://www.primekeys.app'

export const metadata: Metadata = {
  title: 'Refund Policy | PRIMEKEYS',
  description:
    'Read the PRIMEKEYS Refund Policy. If your subscription is not delivered within 24 hours, you are entitled to a full refund.',
  alternates: { canonical: `${BASE_URL}/refunds` },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Refund Policy | PRIMEKEYS',
    description:
      'PRIMEKEYS offers full refunds for undelivered orders and pro-rated refunds for service interruptions. Read the full refund policy.',
    url: `${BASE_URL}/refunds`,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS Refund Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund Policy | PRIMEKEYS',
    description: 'PRIMEKEYS offers full refunds for undelivered orders and pro-rated refunds for service interruptions.',
    images: [`${BASE_URL}/opengraph-image`],
  },
}
