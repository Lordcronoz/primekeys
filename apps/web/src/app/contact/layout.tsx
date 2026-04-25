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
      name: 'Contact PRIMEKEYS',
      item: `${BASE_URL}/contact`,
    },
  ],
}

const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${BASE_URL}/contact#webpage`,
  url: `${BASE_URL}/contact`,
  name: 'Contact PRIMEKEYS — WhatsApp & Email Support',
  isPartOf: { '@id': `${BASE_URL}/#website` },
  about: { '@id': `${BASE_URL}/#business` },
  inLanguage: 'en',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      {children}
    </>
  )
}
