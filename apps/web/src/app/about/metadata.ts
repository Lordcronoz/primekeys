import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About PRIMEKEYS — Our Story, Team & Mission',
  description:
    'Meet the team behind PRIMEKEYS — India\'s leading premium subscription reseller. Founded by college students to make Netflix, Spotify, ChatGPT & more affordable for everyone.',
  alternates: { canonical: 'https://primekeys.app/about' },
  keywords: [
    'PRIMEKEYS about',
    'PRIMEKEYS team',
    'who is PRIMEKEYS',
    'subscription reseller India founders',
    'S&M Holdings India',
    'Aaron Joy Thomas',
    'Nicholson Samuel Varghese',
    'affordable subscriptions India founders',
  ].join(', '),
  openGraph: {
    title: 'About PRIMEKEYS — Built by Students. For Everyone.',
    description:
      'Founded in 2024 by two college students tired of paying full price for subscriptions. PRIMEKEYS makes premium software accessible to all Indians.',
    url: 'https://primekeys.app/about',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: 'https://primekeys.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS — Built by students, for everyone',
      },
    ],
  },
}
