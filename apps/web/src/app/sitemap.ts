import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://primekeys.app'
  return [
    { url: base,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/store`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/privacy`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/refunds`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/shipping`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
