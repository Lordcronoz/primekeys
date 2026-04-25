import type { Metadata } from 'next'

const BASE_URL = 'https://www.primekeys.app'

export const metadata: Metadata = {
  title: 'About PRIMEKEYS — Who We Are & What We Do',
  description:
    'PRIMEKEYS is a global digital subscription reseller based in Kerala, India. We make Netflix, Spotify, ChatGPT Plus, Microsoft 365, Windows keys and VPNs affordable for everyone worldwide.',
  alternates: { canonical: `${BASE_URL}/about` },
  keywords: [
    'PRIMEKEYS about',
    'who is PRIMEKEYS',
    'digital subscription reseller India',
    'cheap subscriptions worldwide',
    'PRIMEKEYS team',
    'S&M Holdings India',
  ].join(', '),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'About PRIMEKEYS — Built for Everyone Who Pays for Subscriptions',
    description:
      'PRIMEKEYS is a digital subscription reseller based in Kerala, India. We make premium software accessible to everyone worldwide at up to 80% off.',
    url: `${BASE_URL}/about`,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS — Premium subscriptions made affordable for everyone',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PRIMEKEYS — Built for Everyone Who Pays for Subscriptions',
    description:
      'PRIMEKEYS makes Netflix, Spotify, ChatGPT Plus, Microsoft 365 and more accessible to everyone worldwide at up to 80% off.',
    images: [`${BASE_URL}/opengraph-image`],
  },
}
