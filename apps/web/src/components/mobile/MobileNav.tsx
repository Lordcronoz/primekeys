'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon'
import { MessageSquare, Settings, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CurrencyPicker } from '../Nav' // Reusing CurrencyPicker for now or we can move it too

export function MobileNav() {
  const pathname = usePathname()
  const { user, isTeam, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const links = [
    { href: '/',             label: 'Home'       },
    { href: '/store',        label: 'Store'      },
    { href: '/about',        label: 'About'      },
    ...(user     ? [{ href: '/portal',       label: 'My Account' }] : []),
    ...(isTeam   ? [{ href: '/portal/admin', label: 'Admin'      }] : []),
  ]

  useEffect(() => {
    const html = document.documentElement
    if (mobileOpen) {
      html.classList.add('mobile-menu-open')
    } else {
      html.classList.remove('mobile-menu-open')
    }
    // Always clean up — safety net
    return () => { html.classList.remove('mobile-menu-open') }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
    document.documentElement.classList.remove('mobile-menu-open')
  }, [pathname])

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: 0,
      }}>
        <div style={{
          width: '100%',
          height: 52,
          background: mobileOpen ? 'rgba(0,0,0,0.98)' : 'rgba(0,0,0,0.88)',
          backdropFilter: 'saturate(180%) blur(8px)',
          WebkitBackdropFilter: 'saturate(180%) blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', boxSizing: 'border-box',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em' }}>PRIME</span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em' }}>KEYS</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CurrencyPicker />
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, cursor: 'pointer', color: '#f5f5f7',
              }}
            >
              <MenuToggleIcon open={mobileOpen} style={{ width: 18, height: 18 }} duration={300} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div style={{
        position: 'fixed', top: 52, left: 0, right: 0, bottom: 0,
        background: '#000', zIndex: 99,
        padding: '24px 20px',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: mobileOpen ? 1 : 0,
        transform: mobileOpen ? 'translateY(0)' : 'translateY(-10px)',
        pointerEvents: mobileOpen ? 'auto' : 'none',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              textDecoration: 'none', fontSize: 24, fontWeight: 700,
              color: isActive(link.href) ? '#D4AF37' : '#fff',
              padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              {link.label}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.3 }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!user ? (
            <Link href="/auth" style={{
              height: 54, borderRadius: 14, background: '#fff', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, textDecoration: 'none',
            }}>
              Sign In
            </Link>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #C49A20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#000' }}>
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{user.displayName || user.email?.split('@')[0]}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
                </div>
              </div>
              <button
                onClick={async () => { await signOut(); router.push('/') }}
                style={{
                  height: 54, borderRadius: 14, background: 'rgba(255,59,48,0.1)', color: '#ff3b30',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          )}
          <a href="https://wa.me/918111956481" target="_blank" style={{
            height: 54, borderRadius: 14, background: 'rgba(255,255,255,0.05)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 16, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <MessageSquare size={18} />
            Contact Support
          </a>
        </div>
      </div>
    </>
  )
}
