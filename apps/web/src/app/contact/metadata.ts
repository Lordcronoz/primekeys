import type { Metadata } from 'next'

const BASE_URL = 'https://www.primekeys.app'

export const metadata: Metadata = {
  title: 'Contact PRIMEKEYS — WhatsApp & Email Support',
  description:
    'Contact PRIMEKEYS support via WhatsApp (+91 81119 56481) or email (admin@primekeys.app). We respond within minutes, 7 days a week, 10 AM – 10 PM IST.',
  alternates: { canonical: `${BASE_URL}/contact` },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Contact PRIMEKEYS — WhatsApp & Email Support',
    description:
      'Reach PRIMEKEYS on WhatsApp at +91 81119 56481 or email admin@primekeys.app. Fast responses, 7 days a week.',
    url: `${BASE_URL}/contact`,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Contact PRIMEKEYS support — WhatsApp and email available 7 days a week',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact PRIMEKEYS — WhatsApp & Email Support',
    description:
      'Reach PRIMEKEYS on WhatsApp at +91 81119 56481 or email admin@primekeys.app. Fast responses, 7 days a week.',
    images: [`${BASE_URL}/opengraph-image`],
  },
}
