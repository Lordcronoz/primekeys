'use client'

import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { PRODUCTS } from '@primekeys/shared'
import { PricingPanel } from '@/components/PricingPanel'

const BRAND_MAP: Record<string, { icon: string; color: string }> = {
  netflix:  { icon: 'netflix',    color: 'E50914' },
  spotify:  { icon: 'spotify',    color: '1DB954' },
  youtube:  { icon: 'youtube',    color: 'FF0000' },
  chatgpt:  { icon: 'openai',     color: 'ffffff' },
  disney:   { icon: 'disneyplus', color: '113CCF' },
  canva:    { icon: 'canva',      color: '00C4CC' },
  amazon:   { icon: 'amazon',     color: 'FF9900' },
  linkedin: { icon: 'linkedin',   color: '0A66C2' },
  appletv:  { icon: 'appletv',    color: 'ffffff' },
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = PRODUCTS.find(p => p.id === id)
  if (!product) notFound()

  const brand = BRAND_MAP[product.id]

  return (
    <main style={{ background: '#000', minHeight: '100vh', paddingTop: 44 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: 64,
          alignItems: 'start',
        }}>

          {/* Left */}
          <div>
            {/* Brand icon */}
            <div style={{ width: 80, height: 80, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {brand ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://cdn.simpleicons.org/${brand.icon}/${brand.color}`}
                  alt={product.name}
                  width={64}
                  height={64}
                  style={{ objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: product.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 28,
                  fontWeight: 700,
                }}>
                  {product.name[0]}
                </div>
              )}
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#f5f5f7',
              lineHeight: 1.05,
              marginBottom: 16,
            }}>
              {product.name}.
            </h1>

            <p style={{ fontSize: 19, color: '#a1a1a6', lineHeight: 1.6, marginBottom: 48, maxWidth: 520 }}>
              {product.description}
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: 48 }} />

            {/* Features */}
            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 24 }}>
              What's included.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 48 }}>
              {product.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: '#D4AF37', fontSize: 16, marginTop: 2, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 15, color: '#a1a1a6', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: 48 }} />

            {/* Info */}
            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 24 }}>
              Good to know.
            </h2>
            <div style={{
              background: '#1d1d1f',
              borderRadius: 16,
              padding: 28,
            }}>
              {[
                'Credentials delivered to your WhatsApp, usually within 5 minutes.',
                'Do not change the account email or password — this voids your warranty.',
                'Full replacement warranty for the entire duration of your plan.',
                'Delivery may take up to 2 hours during peak times (rare).',
              ].map((text, i) => (
                <p key={i} style={{
                  fontSize: 14,
                  color: '#a1a1a6',
                  lineHeight: 1.6,
                  paddingBottom: i < 3 ? 16 : 0,
                  marginBottom: i < 3 ? 16 : 0,
                  borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  {text}
                </p>
              ))}
            </div>
          </div>

          {/* Right: Pricing sticky panel */}
          <div style={{ position: 'sticky', top: 68 }}>
            <PricingPanel product={product} />
          </div>

        </div>
      </div>
    </main>
  )
}
