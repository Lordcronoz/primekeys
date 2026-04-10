import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { MaintenanceGate } from '@/components/ui/MaintenanceGate'
import { ShellWrapper } from '@/components/ShellWrapper'

const BASE_URL = 'https://primekeys.app'
const OG_IMAGE = `${BASE_URL}/og-image.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── Titles & descriptions ────────────────────────────────────────────────────
  title: {
    default: 'PRIMEKEYS — Netflix, Spotify & More at 80% Off | India',
    template: '%s | PRIMEKEYS',
  },
  description:
    'Buy Netflix, Spotify, ChatGPT Plus, Disney+, YouTube Premium & Canva Pro subscriptions at up to 80% off. Official accounts delivered to your WhatsApp in under 5 minutes. Trusted by 10,000+ customers across India.',

  // ── Keyword corpus ───────────────────────────────────────────────────────────
  keywords: [
    // brand
    'PRIMEKEYS', 'primekeys.app', 'PrimeKeys India', 'S&M Holdings',
    // intent
    'cheap Netflix subscription India',
    'buy Netflix account India',
    'Netflix 4K cheap India',
    'Spotify premium cheap India',
    'buy Spotify India',
    'ChatGPT Plus cheap India',
    'buy ChatGPT Plus subscription',
    'Disney Plus cheap India',
    'YouTube Premium India cheap',
    'buy YouTube Premium India',
    'Canva Pro cheap India',
    'Microsoft 365 cheap India',
    'premium subscriptions India',
    'cheap streaming subscriptions India',
    'discount subscriptions India',
    'affordable Netflix India',
    'Netflix subscription at 80% off',
    'Spotify at 80% off India',
    'buy premium accounts India',
    'digital subscriptions India',
    'cheap digital subscriptions',
    'subscription reseller India',
    'WhatsApp subscription delivery',
    'instant account delivery India',
    'cheap OTT subscriptions India',
    'Netflix Hotstar cheap India',
    'gaming subscriptions cheap India',
    'SaaS subscriptions cheap India',
    'student subscriptions India',
    'Netflix account sharing India',
    'Spotify family plan India cheap',
    'group subscription India',
    'affordable chatgpt india',
  ].join(', '),

  // ── Canonical / alternates ───────────────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
    languages: { 'en-IN': BASE_URL },
  },

  // ── Open Graph ───────────────────────────────────────────────────────────────
  openGraph: {
    title: 'PRIMEKEYS — Premium Subscriptions at 80% Off | India',
    description:
      'Netflix, Spotify, ChatGPT Plus & more — official accounts delivered to your WhatsApp in under 5 minutes. Save up to 80%. Trusted by 10,000+ Indians.',
    url: BASE_URL,
    siteName: 'PRIMEKEYS',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'PRIMEKEYS — Premium subscriptions at up to 80% off, delivered to your WhatsApp',
      },
    ],
  },

  // ── Twitter card ─────────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@primekeys',
    creator: '@primekeys',
    title: 'PRIMEKEYS — Premium Subscriptions at 80% Off | India',
    description:
      'Netflix, Spotify, ChatGPT Plus & more. Official accounts. WhatsApp delivery in under 5 minutes. Up to 80% off.',
    images: [OG_IMAGE],
  },

  // ── Robots ───────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
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

// ── JSON-LD structured data ───────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PRIMEKEYS',
  alternateName: 'S&M Holdings',
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  description:
    'PRIMEKEYS is India\'s leading premium subscription reseller. We offer Netflix, Spotify, ChatGPT Plus, Disney+, YouTube Premium and more at up to 80% off, delivered via WhatsApp in under 5 minutes.',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-8111956481',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
      contactOption: 'TollFree',
    },
  ],
  sameAs: [
    'https://wa.me/918111956481',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  email: 'admin@primekeys.app',
  foundingDate: '2024',
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PRIMEKEYS',
  url: BASE_URL,
  description: 'Buy Netflix, Spotify, ChatGPT Plus & more at up to 80% off. Official accounts. WhatsApp delivery in under 5 minutes.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/store?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does PRIMEKEYS deliver subscriptions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After payment, we send your official subscription credentials directly to your WhatsApp number in under 5 minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the subscriptions official and safe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All accounts are 100% official. We never use pirated software or cracked accounts. Every subscription works exactly like the one you would buy directly from the platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much can I save with PRIMEKEYS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can save up to 80% compared to official retail prices. For example, Netflix 4K costs ₹649/month officially but you pay a fraction of that with PRIMEKEYS.',
      },
    },
    {
      '@type': 'Question',
      name: 'What subscriptions does PRIMEKEYS offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PRIMEKEYS offers Netflix, Spotify, ChatGPT Plus, Disney+, YouTube Premium, Canva Pro, Microsoft 365, and many more premium digital subscriptions at up to 80% off.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods does PRIMEKEYS accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept UPI for Indian customers and international payments via PayPal and Wise for customers outside India.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is PRIMEKEYS available outside India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. While we primarily serve Indian customers, we also deliver subscriptions internationally. International customers can pay via PayPal or Wise.',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Emergency scroll-reset for mobile Chrome */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
                  if (!isMobile) return;
                  
                  var resetScroll = function() {
                    if (document.body) {
                      document.body.style.overflow = 'auto';
                      document.body.style.touchAction = 'auto';
                    }
                    if (document.documentElement) {
                      document.documentElement.style.overflow = 'auto';
                    }
                  };
                  window.addEventListener('load', resetScroll);
                  setTimeout(resetScroll, 1000);
                  setTimeout(resetScroll, 3000);
                  setTimeout(resetScroll, 5000);
                }
              })();
            `,
          }}
        />
        {/* Preconnect to key origins for performance & Core Web Vitals */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdn.simpleicons.org" crossOrigin="" />
        {/* Geographic targeting */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="3 days" />
        <meta name="rating" content="general" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="msapplication-TileColor" content="#000000" />
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>
        <AuthProvider>
          <CurrencyProvider>
            <MaintenanceGate>
              <ShellWrapper>{children}</ShellWrapper>
            </MaintenanceGate>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}