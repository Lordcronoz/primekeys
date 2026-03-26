import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/portal/' },
    sitemap: 'https://primekeys.app/sitemap.xml',
  }
}
