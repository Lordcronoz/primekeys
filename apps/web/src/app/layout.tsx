import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { CartProvider } from '@/context/CartContext'
import { CartDrawer } from '@/components/CartDrawer'
import { MaintenanceGate } from '@/components/ui/MaintenanceGate'
import { ShellWrapper } from '@/components/ShellWrapper'
import Script from 'next/script'
const BASE_URL = 'https://www.primekeys.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── Titles & descriptions ────────────────────────────────────────────────────
  title: {
    default: 'Cheap Premium Subscriptions | PRIMEKEYS',
    template: '%s | PRIMEKEYS',
  },
  description:
    'Buy Netflix, Spotify, ChatGPT Plus, Microsoft 365 & more at up to 80% off. Official accounts delivered to your WhatsApp in under 5 minutes. Worldwide delivery.',

  // ── Keyword corpus ───────────────────────────────────────────────────────────
  keywords: [
    'PRIMEKEYS',
    'primekeys.app',
    'cheap Netflix subscription',
    'buy Netflix account',
    'Netflix 4K cheap',
    'Spotify premium cheap',
    'buy Spotify subscription',
    'ChatGPT Plus cheap',
    'buy ChatGPT Plus subscription',
    'Microsoft 365 cheap',
    'Windows key cheap',
    'cheap VPN subscription',
    'premium subscriptions cheap',
    'cheap streaming subscriptions',
    'discount subscriptions',
    'digital subscriptions cheap',
    'subscription reseller',
    'WhatsApp subscription delivery',
    'instant account delivery',
    'cheap OTT subscriptions',
    'buy premium accounts',
    'affordable subscriptions worldwide',
  ].join(', '),

  // ── Canonical / alternates ───────────────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
    languages: { en: BASE_URL },
  },

  // ── Open Graph ───────────────────────────────────────────────────────────────
  openGraph: {
    title: 'Cheap Premium Subscriptions | PRIMEKEYS',
    description:
      'Netflix, Spotify, ChatGPT Plus & more — official accounts delivered to your WhatsApp in under 5 minutes. Save up to 80%.',
    url: BASE_URL,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en',
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS — Premium subscriptions at up to 80% off, delivered to your WhatsApp',
      },
    ],
  },

  // ── Twitter card ─────────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Cheap Premium Subscriptions | PRIMEKEYS',
    description:
      'Netflix, Spotify, ChatGPT Plus & more. Official accounts. WhatsApp delivery in under 5 minutes. Up to 80% off.',
    images: [`${BASE_URL}/opengraph-image`],
  },

  // ── Robots ───────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  // ── App / PWA ────────────────────────────────────────────────────────────────
  applicationName: 'PRIMEKEYS',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'PRIMEKEYS' },
  formatDetection: { telephone: false },

  // ── Icons ────────────────────────────────────────────────────────────────────
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },

  // ── Category / classification ────────────────────────────────────────────────
  category: 'shopping',
}

// ── JSON-LD structured data (@graph on homepage) ──────────────────────────────
const homepageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'OnlineStore',
      '@id': `${BASE_URL}/#business`,
      name: 'PRIMEKEYS',
      alternateName: 'S&M Holdings',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
      description:
        'PRIMEKEYS is a global digital subscription reseller. We offer Netflix, Spotify, ChatGPT Plus, Microsoft 365, Windows keys, VPNs and more at up to 80% off, delivered via WhatsApp in under 5 minutes.',
      telephone: '+918111956481',
      email: 'admin@primekeys.app',
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'Kerala',
        addressCountry: 'IN',
      },
      areaServed: [
        'Worldwide',
        'India',
        'Southeast Asia',
        'Middle East',
        'Africa',
        'Latin America',
        'Eastern Europe',
        'South Asia',
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+918111956481',
          contactType: 'customer service',
          areaServed: 'Worldwide',
          availableLanguage: ['English'],
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
            ],
            opens: '10:00',
            closes: '22:00',
          },
        },
      ],
      sameAs: [
        'https://www.instagram.com/primekeys.official',
        'https://www.tiktok.com/@primekeys.official',
        'https://wa.me/918111956481',
        'https://chat.whatsapp.com/JWqQlGcNrmU4uXehgACsEm',
      ],
      foundingDate: '2024',
      priceRange: '$$',
      currenciesAccepted: 'INR, USD',
      paymentAccepted: 'UPI, PayPal, Wise',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Digital Subscriptions',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Netflix Subscription' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Spotify Premium' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'ChatGPT Plus' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Microsoft 365' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Windows License Key' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'VPN Subscription' } },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name: 'PRIMEKEYS',
      url: BASE_URL,
      inLanguage: 'en',
      description:
        'Buy Netflix, Spotify, ChatGPT Plus & more at up to 80% off. Official accounts. WhatsApp delivery in under 5 minutes.',
      publisher: { '@id': `${BASE_URL}/#business` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/store?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/#webpage`,
      url: BASE_URL,
      name: 'Cheap Premium Subscriptions | PRIMEKEYS',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: { '@id': `${BASE_URL}/#business` },
      inLanguage: 'en',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '.speakable'],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${BASE_URL}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does PRIMEKEYS deliver subscriptions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'After payment, PRIMEKEYS sends your official subscription credentials directly to your WhatsApp number in under 5 minutes.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are the subscriptions from PRIMEKEYS official and safe?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All accounts sold by PRIMEKEYS are 100% official. We never use pirated software or cracked accounts. Every subscription works exactly like one bought directly from the platform.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much can I save with PRIMEKEYS?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can save up to 80% compared to official retail prices. PRIMEKEYS makes premium digital subscriptions accessible worldwide at a fraction of the standard cost.',
          },
        },
        {
          '@type': 'Question',
          name: 'What subscriptions does PRIMEKEYS offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PRIMEKEYS offers Netflix, Spotify, ChatGPT Plus, Microsoft 365, Windows license keys, VPNs, and many more premium digital subscriptions at up to 80% off.',
          },
        },
        {
          '@type': 'Question',
          name: 'What payment methods does PRIMEKEYS accept?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PRIMEKEYS accepts UPI for customers in India and international payments via PayPal and Wise for customers outside India.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is PRIMEKEYS available outside India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. PRIMEKEYS delivers subscriptions worldwide. International customers can pay via PayPal or Wise and receive credentials on WhatsApp regardless of location.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does delivery take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PRIMEKEYS typically delivers subscription credentials to your WhatsApp in under 5 minutes after payment is confirmed. In exceptional cases, delivery may take up to 24 hours.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is PRIMEKEYS refund policy?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'If PRIMEKEYS cannot deliver your subscription within 24 hours, you are entitled to a full refund. If a subscription stops working due to a platform issue, PRIMEKEYS will replace it or issue a pro-rated refund.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does PRIMEKEYS sell Windows license keys?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. PRIMEKEYS sells genuine Microsoft Windows license keys at up to 80% off the official retail price, delivered digitally to your WhatsApp.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does PRIMEKEYS sell Microsoft 365?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. PRIMEKEYS offers Microsoft 365 subscriptions (formerly Microsoft Office) at a significant discount, delivered instantly to your WhatsApp.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does PRIMEKEYS sell VPN subscriptions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. PRIMEKEYS offers VPN subscriptions at discounted prices, giving you secure and private internet access at a fraction of the standard cost.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I contact PRIMEKEYS support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can contact PRIMEKEYS support via WhatsApp at +91 81119 56481 or by email at admin@primekeys.app. Support is available 7 days a week from 10 AM to 10 PM IST.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to key origins for performance & Core Web Vitals */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdn.simpleicons.org" crossOrigin="" />
        {/* Geographic / language signals */}
        <meta name="geo.region" content="IN-KL" />
        <meta name="geo.country" content="India" />
        <meta name="language" content="English" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="msapplication-TileColor" content="#000000" />
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
        />
      </head>
      <body>
        {/* Google Analytics 4 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-SRMSJ89W67" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SRMSJ89W67');
          `}
        </Script>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <MaintenanceGate>
                <ShellWrapper>{children}</ShellWrapper>
                <CartDrawer />
              </MaintenanceGate>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}