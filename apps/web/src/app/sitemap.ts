import { MetadataRoute } from 'next'

// Policy pages rarely change — use a stable date so Googlebot doesn't waste crawl budget
const POLICY_DATE = new Date('2026-03-01')
const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://primekeys.app'
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
      priority: 0.95,
    },
    // ── Brand / trust pages ───────────────────────────────────────────────────
    {
      url: `${base}/about`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // ── Auth ──────────────────────────────────────────────────────────────────
    {
      url: `${base}/auth`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.4,
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
  ]
}
