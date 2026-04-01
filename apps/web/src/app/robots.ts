import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All major crawlers — allow everything except private routes
        userAgent: '*',
        allow: '/',
        disallow: [
          '/portal/',    // admin portal
          '/api/',       // backend API routes
          '/checkout',   // payment flow (no value indexing payment pages)
          '/auth',       // auth pages
        ],
      },
      {
        // Explicitly invite Google to crawl at a healthy rate
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout'],
        crawlDelay: 0,
      },
      {
        // Bing
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout'],
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://primekeys.app/sitemap.xml',
    host: 'https://primekeys.app',
  }
}
