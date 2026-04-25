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
      name: 'About PRIMEKEYS',
      item: `${BASE_URL}/about`,
    },
  ],
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${BASE_URL}/about#webpage`,
  url: `${BASE_URL}/about`,
  name: 'About PRIMEKEYS — Who We Are & What We Do',
  isPartOf: { '@id': `${BASE_URL}/#website` },
  about: { '@id': `${BASE_URL}/#business` },
  inLanguage: 'en',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.speakable'],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {children}
    </>
  )
}
