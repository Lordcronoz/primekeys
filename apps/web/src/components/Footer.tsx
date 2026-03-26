'use client'

import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'

const SGC_COMPANIES = [
  { name: 'PRIMEKEYS', url: '/',   live: true,  color: '#D4AF37' },
  { name: 'RYZN',      url: null,  live: false, color: '#60a5fa' },
  { name: 'TBD Studio',url: null,  live: false, color: '#a78bfa' },
  { name: 'SGC',       url: null,  live: false, color: '#f5f5f7' },
]

const PRIMEKEYS_LINKS = [
  { label: 'Home',       href: '/'        },
  { label: 'Store',      href: '/store'   },
  { label: 'About',      href: '/about'   },
  { label: 'My Account', href: '/portal'  },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy',   href: '/privacy'  },
  { label: 'Terms of Use',     href: '/terms'    },
  { label: 'Refund Policy',    href: '/refunds'  },
  { label: 'Shipping Policy',  href: '/shipping' },
  { label: 'Contact Us',       href: '/contact'  },
]

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-link {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-link:hover { color: #f0f0f0; }

        .footer-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: grid;
          place-items: center;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: all 0.2s;
        }
        .footer-icon-btn:hover {
          border-color: rgba(212,175,55,0.3);
          color: #D4AF37;
        }
        .footer-icon-btn.wa:hover {
          border-color: rgba(37,211,102,0.3);
          color: #25D366;
        }
        .footer-company-link {
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .footer-company-link:hover { opacity: 0.7; }
      `}</style>

      <footer style={{
        background: '#060606',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '64px 24px 32px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ── Top grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48,
            marginBottom: 64,
          }}>

            {/* Brand block */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
                A Seraph Group Company
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, marginBottom: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.02em' }}>PRIME</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>KEYS</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, maxWidth: 220, marginBottom: 20 }}>
                Premium digital subscriptions delivered to your WhatsApp in under 5 minutes.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="https://instagram.com/primekeys_offical" target="_blank" rel="noreferrer" className="footer-icon-btn">
                  <Instagram size={15} />
                </a>
                <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer" className="footer-icon-btn wa">
                  <MessageCircle size={15} />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
                Quick Links
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PRIMEKEYS_LINKS.map(link => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* SGC ecosystem */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
                SGC Ecosystem
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {SGC_COMPANIES.map(company => (
                  <div key={company.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: company.live ? company.color : 'rgba(255,255,255,0.15)',
                      flexShrink: 0,
                      boxShadow: company.live ? `0 0 6px ${company.color}` : 'none',
                    }} />
                    {company.live && company.url ? (
                      <Link href={company.url} className="footer-company-link" style={{ color: company.color }}>
                        {company.name}
                      </Link>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                          {company.name}
                        </span>
                        <span style={{
                          fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
                          textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          Soon
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
                Legal
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {LEGAL_LINKS.map(link => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Gold divider ── */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)',
            marginBottom: 28,
          }} />

          {/* ── Trust badges ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: 10, marginBottom: 28,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', marginRight: 6 }}>
              Secured by
            </span>

            {/* PayPal */}
            {[
              {
                label: 'PayPal',
                icon: (
                  <svg height="14" viewBox="0 0 30 32" fill="none">
                    <path d="M25 8c.3 2.1-.2 3.6-1.4 4.9-1.3 1.4-3.6 2.1-6.5 2.1h-1.6c-.5 0-.9.4-1 .9l-1.1 7.1H9.9l.2-1.1 1.8-11.5h4.2c2.1 0 3.6.3 4.6.9 1 .6 1.5 1.7 1.5 3.1l.8-6.4z" fill="#009cde"/>
                    <path d="M11.9 9h4.2c2.1 0 3.7.4 4.7 1.1 1 .8 1.4 2 1.2 3.8-.3 2-1.1 3.4-2.4 4.4-1.3.9-3 1.4-5.2 1.4h-1.6c-.5 0-.9.4-1 .9L10.6 27H6.8l3.3-18h1.8z" fill="#003087"/>
                  </svg>
                ),
              },
              {
                label: 'Google',
                icon: (
                  <svg height="14" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ),
              },
              {
                label: 'Microsoft',
                icon: (
                  <svg height="13" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                ),
              },
              {
                label: 'Firebase',
                icon: (
                  <svg height="14" viewBox="0 0 32 32" fill="none">
                    <path d="M19.62 11.558l-3.203 2.98-2.972-5.995 1.538-3.448c.4-.7 1.024-.692 1.414 0z" fill="#FFA000"/>
                    <path d="M13.445 8.543l2.972 5.995-11.97 11.135z" fill="#F57F17"/>
                    <path d="M23.123 7.003c.572-.55 1.164-.362 1.315.417l3.116 18.105-10.328 6.22c-.36.2-1.32.286-1.32.286s-.874-.104-1.207-.3L4.447 25.673z" fill="#FFCA28"/>
                    <path d="M13.445 8.543L4.447 25.673 7.01 6.645c.148-.78.55-.985 1.123-.432z" fill="#FFA000"/>
                  </svg>
                ),
              },
              {
                label: 'WhatsApp',
                icon: (
                  <svg height="14" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.133 1.532 5.864L.057 23.57a.5.5 0 0 0 .614.612l5.807-1.461A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                ),
              },
              {
                label: 'SSL / TLS',
                icon: (
                  <svg height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {icon}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Bottom row ── */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
              © {new Date().getFullYear()} Seraph Group of Companies. All rights reserved.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
              Made with care in India 🇮🇳
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}