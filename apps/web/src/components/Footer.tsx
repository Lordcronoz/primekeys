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