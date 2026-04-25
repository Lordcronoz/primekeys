'use client'

import Link from 'next/link'
import { Ticker } from '@/components/Ticker'
import { ProductCard } from '@/components/ProductCard'

// Simplified components for mobile to reduce JS overhead and fix layout issues
function MobileSectionReveal({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={style}>{children}</div>
}

function MobileStaggerReveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={style}>{children}</div>
}

function MobileStaggerChild({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={style}>{children}</div>
}

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '28px 20px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 18,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
        background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)',
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(212,175,55,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(212,175,55,0.15)',
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '28px', fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: '#6e6e73', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

const iconColor = '#D4AF37'
const IconBrowse = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M15 9h3M15 13h3"/>
  </svg>
)
const IconPay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 9h20"/><path d="M6 15h4"/>
  </svg>
)
const IconDeliver = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8">
    <path d="M22 16.74A10 10 0 0 1 3.55 18M2 7.26A10 10 0 0 1 20.45 6"/><path d="m9 17-2 3-3-1M18 1l2 3-3 1"/>
  </svg>
)

export default function MobilePage({ featured }: { featured: any[] }) {
  return (
    <main className="pk-grain" style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '60px 20px 40px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px 6px 10px',
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 980, marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#D4AF37', letterSpacing: '0.15em', textTransform: 'uppercase' }}>S&M Holdings</span>
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24 }}>
            <span style={{ color: '#f5f5f7', display: 'block' }}>Premium Subscriptions.</span>
            <span className="pk-shimmer-text">Fraction of the price.</span>
          </h1>

          <p className="speakable" style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.7, marginBottom: 32 }}>
            Netflix, Spotify, ChatGPT Plus, Microsoft 365 &amp; more —
            official accounts at up to <span style={{ color: '#a8a8b0', fontWeight: 500 }}>80% off retail</span>.
            Delivered to your WhatsApp in <span style={{ color: '#a8a8b0', fontWeight: 500 }}>under 5 minutes</span>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/store" style={{
              height: 54, background: 'linear-gradient(135deg, #D4AF37, #C49A20)',
              color: '#000', borderRadius: 980, fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              textDecoration: 'none', boxShadow: '0 8px 24px rgba(212,175,55,0.2)',
            }}>
              Explore Store
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#how-it-works" style={{
              height: 54, background: 'rgba(255,255,255,0.05)',
              color: '#8a8a90', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 980, fontSize: 16, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
            }}>
              How it works ↓
            </a>
          </div>
        </div>
      </section>

      <Ticker />

      <hr className="pk-divider" />

      {/* Stats */}
      <section style={{ padding: '60px 20px' }}>
        <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', marginBottom: 24 }}>
          Trusted by thousands
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StatCard value="10K+" label="Customers" icon={<IconBrowse />} />
          <StatCard value="<5 min" label="Delivery" icon={<IconPay />} />
          <StatCard value="80%" label="Savings" icon={<IconDeliver />} />
          <StatCard value="100%" label="Official" icon={<IconBrowse />} />
        </div>
      </section>

      <hr className="pk-divider" />

      {/* Products */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Most popular</p>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#f5f5f7', marginBottom: 12 }}>The platforms you love.</h2>
          <p style={{ fontSize: 16, color: '#6e6e73' }}>At a price that actually makes sense.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/store" style={{
            height: 48, padding: '0 24px', background: 'rgba(255,255,255,0.05)',
            color: '#8a8a90', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 980, fontSize: 14, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          }}>
            View all subscriptions →
          </Link>
        </div>
      </section>

      <hr className="pk-divider" />

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#f5f5f7', marginBottom: 12 }}>Dead simple. Three steps.</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { n: '01', icon: <IconBrowse />, title: 'Pick your plan', body: 'Browse the catalog and select your subscription and duration.' },
            { n: '02', icon: <IconPay />, title: 'Pay securely', body: 'Checkout in seconds via UPI or Wise. No hidden fees.' },
            { n: '03', icon: <IconDeliver />, title: 'Get access', body: 'Credentials sent to your WhatsApp in under 5 minutes.' },
          ].map(({ n, icon, title, body }) => (
            <div key={n} style={{ background: '#111', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f5f5f7', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.5 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
