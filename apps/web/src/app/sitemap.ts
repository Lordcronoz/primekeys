import { MetadataRoute } from 'next'

// Policy pages are stable — use a fixed date so Googlebot doesn't waste crawl budget
const POLICY_DATE = new Date('2026-03-01')
const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.primekeys.app'
  return [
    // ── Core conversion pages (highest priority) ─────────────────────────────
    {
      url: base,
      lastModified: NOW,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${base}/store`,
      lastModified: NOW,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // ── Brand / trust pages ───────────────────────────────────────────────────
    {
      url: `${base}/about`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/contact`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // ── Legal / policy pages ──────────────────────────────────────────────────
    {
      url: `${base}/privacy`,
      lastModified: POLICY_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: POLICY_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/refunds`,
      lastModified: POLICY_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/shipping`,
      lastModified: POLICY_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // NOTE: /auth is intentionally excluded — private, noindex page
  ]
}
