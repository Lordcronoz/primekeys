export { metadata } from './metadata'

const BASE_URL = 'https://www.primekeys.app'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Subscription Store',
      item: `${BASE_URL}/store`,
    },
  ],
}

const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${BASE_URL}/store#webpage`,
  url: `${BASE_URL}/store`,
  name: 'Buy Cheap Subscriptions — Netflix, Spotify, ChatGPT & More | PRIMEKEYS',
  isPartOf: { '@id': `${BASE_URL}/#website` },
  about: { '@id': `${BASE_URL}/#business` },
  inLanguage: 'en',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.speakable'],
  },
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      {children}
    </>
  )
}
