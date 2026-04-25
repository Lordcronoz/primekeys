import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All crawlers — allow public pages, block private routes
        userAgent: '*',
        allow: '/',
        disallow: [
          '/portal/',   // admin portal
          '/api/',      // backend API routes
          '/checkout',  // payment flow
          '/auth',      // authentication pages
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
        crawlDelay: 1,
      },
      // ── AI crawlers — explicitly invited ──────────────────────────────────
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
      },
      {
        // Google-Extended controls Gemini training — NOT Googlebot-Extended
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/portal/', '/api/', '/checkout', '/auth'],
      },
    ],
    sitemap: 'https://www.primekeys.app/sitemap.xml',
    host: 'https://www.primekeys.app',
  }
}
