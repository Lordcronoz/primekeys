import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscription Store — Netflix, Spotify, ChatGPT & More',
  description:
    'Shop all premium subscriptions at up to 80% off. Netflix 4K, Spotify Premium, ChatGPT Plus, Disney+, YouTube Premium, Canva Pro & more. Official accounts. WhatsApp delivery in 5 minutes.',
  alternates: { canonical: 'https://primekeys.app/store' },
  keywords: [
    'buy Netflix India cheap',
    'buy Spotify premium India',
    'buy ChatGPT Plus India',
    'buy Disney Plus India',
    'buy YouTube Premium India',
    'buy Canva Pro India',
    'subscription store India',
    'premium subscription shop India',
    'cheap OTT store India',
    'PRIMEKEYS store',
  ].join(', '),
  openGraph: {
    title: 'PRIMEKEYS Store — Buy Premium Subscriptions at 80% Off',
    description:
      'Netflix, Spotify, ChatGPT Plus & more. Official accounts delivered to WhatsApp in 5 min.',
    url: 'https://primekeys.app/store',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: 'https://primekeys.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS Store — Premium subscriptions at up to 80% off',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PRIMEKEYS Store — Premium Subscriptions at 80% Off',
    description: 'Netflix, Spotify, ChatGPT Plus & more. Delivered to WhatsApp in 5 minutes.',
    images: ['https://primekeys.app/og-image.jpg'],
  },
}
