'use client'

import Link from 'next/link'
import { MessageCircle, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Support</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em', marginBottom: 14 }}>Contact Us</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            We&apos;re here to help. Reach us via WhatsApp for the fastest response, or drop us an email and we&apos;ll get back to you within a few hours.
          </p>
          <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)', marginTop: 28 }} />
        </div>

        {/* Contact cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 56 }}>

          {/* WhatsApp */}
          <a
            href="https://wa.me/918111956481"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              padding: '24px 28px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18,
              transition: 'border-color 0.2s, background 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.35)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(212,175,55,0.04)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageCircle size={22} color="#25D366" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 4 }}>WhatsApp</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>+91 8111956481 — Fastest response, usually within minutes</p>
              </div>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }}>↗</span>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:admin@primekeys.app"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              padding: '24px 28px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18,
              transition: 'border-color 0.2s, background 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.35)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(212,175,55,0.04)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mail size={22} color="#D4AF37" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 4 }}>Email</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>admin@primekeys.app — We reply within a few hours</p>
              </div>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }}>↗</span>
            </div>
          </a>

          {/* Hours */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '24px 28px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={22} color="rgba(255,255,255,0.4)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 4 }}>Support Hours</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>7 days a week · 10:00 AM – 10:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* FAQ quick links */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Quick links</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Refund Policy', href: '/refunds' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Use', href: '/terms' },
              { label: 'Shipping Policy', href: '/shipping' },
            ].map(({ label, href }) => (
              <Link key={href} href={href} style={{
                display: 'block', padding: '14px 18px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, textDecoration: 'none',
                fontSize: 13, color: 'rgba(255,255,255,0.5)',
                fontWeight: 500, transition: 'color 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#D4AF37'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,175,55,0.25)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.06)'
                }}
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 0, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ fontSize: 13, color: '#D4AF37', textDecoration: 'none' }}>← Back to Home</Link>
        </div>

      </div>
    </div>
  )
}
