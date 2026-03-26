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
            flexWrap: 'wrap', gap: 12, marginBottom: 28,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', marginRight: 4 }}>
              Secured by
            </span>

            {/* PayPal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <svg height="13" viewBox="0 0 124 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746z" fill="rgba(255,255,255,0.4)"/>
                <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746z" fill="rgba(255,255,255,0.4)"/>
              </svg>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>PayPal</span>
            </div>

            {/* Google Firebase */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <svg height="13" viewBox="0 0 24 24" fill="none">
                <path d="M3.89 15.672L6.255.461A.542.542 0 0 1 7.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 0 0-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 0 0 1.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 0 0-.96 0L3.53 17.984z" fill="rgba(255,165,0,0.6)"/>
              </svg>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Firebase</span>
            </div>

            {/* WhatsApp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <svg height="13" viewBox="0 0 24 24" fill="rgba(37,211,102,0.7)">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.133 1.532 5.864L.057 23.57a.5.5 0 0 0 .614.612l5.807-1.461A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>WhatsApp Business</span>
            </div>

            {/* SSL */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <svg height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>SSL / TLS</span>
            </div>
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