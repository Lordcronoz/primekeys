import type { Metadata } from 'next'

const BASE_URL = 'https://www.primekeys.app'

export const metadata: Metadata = {
  title: 'Buy Cheap Subscriptions — Netflix, Spotify, ChatGPT & More',
  description:
    'Shop all premium digital subscriptions at up to 80% off. Netflix, Spotify Premium, ChatGPT Plus, Microsoft 365, Windows keys, VPNs & more. Official accounts. WhatsApp delivery in 5 minutes.',
  alternates: { canonical: `${BASE_URL}/store` },
  keywords: [
    'buy Netflix cheap',
    'buy Spotify premium',
    'buy ChatGPT Plus',
    'buy Microsoft 365 cheap',
    'buy Windows license key',
    'cheap VPN subscription',
    'subscription store',
    'premium subscription shop',
    'cheap digital subscriptions',
    'PRIMEKEYS store',
  ].join(', '),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Buy Cheap Subscriptions — Netflix, Spotify, ChatGPT & More | PRIMEKEYS',
    description:
      'Netflix, Spotify, ChatGPT Plus, Microsoft 365, Windows keys & more. Official accounts delivered to WhatsApp in 5 min. Up to 80% off.',
    url: `${BASE_URL}/store`,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS Store — Buy cheap premium subscriptions at up to 80% off',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy Cheap Subscriptions — Netflix, Spotify, ChatGPT & More | PRIMEKEYS',
    description:
      'Netflix, Spotify, ChatGPT Plus, Microsoft 365, Windows keys & more. Delivered to WhatsApp in 5 minutes. Up to 80% off.',
    images: [`${BASE_URL}/opengraph-image`],
  },
}
