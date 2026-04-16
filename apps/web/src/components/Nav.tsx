'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { REGIONS, CURRENCIES, REGION_TO_CURRENCY } from '@primekeys/shared'
import { useState, useRef, useEffect } from 'react'
import { useScroll } from '@/components/ui/use-scroll'
import { UserProfileDropdown } from '@/components/ui/user-profile-dropdown'
import { MessageSquare, Settings, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CurrencyPicker() {
  const { region, currencyCode, setRegion } = useCurrency()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const currentCurrency = CURRENCIES[currencyCode]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = REGIONS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (REGION_TO_CURRENCY[r.code] || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => { setOpen(o => !o); setSearch('') }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          height: 28, padding: '0 10px',
          background: open ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.05)',
          border: open ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: 980, color: '#f5f5f7', fontSize: 12, fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
        }}
      >
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>{currentCurrency?.flag} {currencyCode}</span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ opacity: 0.4, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 230,
          background: 'rgba(14,14,16,0.98)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)', zIndex: 9999,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 10px 6px',
            position: 'sticky', top: 0,
            background: 'rgba(14,14,16,0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            zIndex: 1,
          }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country..."
              style={{
                width: '100%', height: 32, padding: '0 10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#f5f5f7', fontSize: 12,
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ maxHeight: 240, overflowY: 'auto', overflowX: 'hidden', padding: '4px 6px 8px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: '#555', fontSize: 12 }}>No results</div>
            ) : filtered.map(r => {
              const currCode = REGION_TO_CURRENCY[r.code] || 'INR'
              const curr = CURRENCIES[currCode]
              const isSelected = r.code === region
              return (
                <button
                  key={r.code}
                  onClick={() => { setRegion(r.code); setOpen(false); setSearch('') }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 8px', borderRadius: 8, border: 'none',
                    background: isSelected ? 'rgba(212,175,55,0.1)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 14 }}>{curr?.flag}</span>
                  <span style={{ flex: 1, fontSize: 12, color: isSelected ? '#f5f5f7' : '#a1a1a6', fontWeight: isSelected ? 600 : 400 }}>
                    {r.name}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#D4AF37' : '#444' }}>{currCode}</span>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function Nav() {
  const pathname = usePathname()
  const { user, isTeam, signOut } = useAuth()
  const scrolled = useScroll(40)
  const router = useRouter()

  const dropdownActions = [
    { icon: MessageSquare, label: 'Support', onClick: () => window.open('https://wa.me/918111956481', '_blank') },
    { icon: Settings,      label: 'Settings', onClick: () => router.push('/portal?tab=settings') },
    { icon: User,          label: 'Profile',  onClick: () => router.push('/portal?tab=profile')  },
  ]

  const dropdownMenu = [
    { icon: User,     label: 'Account Settings', hasArrow: true, onClick: () => router.push('/portal?tab=settings')     },
    { icon: Settings, label: 'Preferences',       hasArrow: true, onClick: () => router.push('/portal?tab=preferences') },
    { icon: LogOut,   label: 'Sign Out', isDestructive: true, onClick: async () => { await signOut(); router.push('/') } },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const links = [
    { href: '/',             label: 'Home'       },
    { href: '/store',        label: 'Store'      },
    { href: '/about',        label: 'About'      },
    ...(user     ? [{ href: '/portal',       label: 'My Account' }] : []),
    ...(isTeam   ? [{ href: '/portal/admin', label: 'Admin'      }] : []),
  ]

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
      ...(scrolled ? {
        padding: '8px 24px',
        display: 'flex', justifyContent: 'center',
      } : { padding: 0 }),
    }}>
      <div className="pk-nav-inner" style={{
        width: '100%',
        height: scrolled ? 44 : 52,
        background: scrolled ? 'rgba(10,10,12,0.88)' : 'rgba(0,0,0,0.88)',
        backdropFilter: 'saturate(180%) blur(8px)',
        WebkitBackdropFilter: 'saturate(180%) blur(8px)',
        borderBottom: scrolled ? 'none' : '1px solid rgba(255,255,255,0.06)',
        border: scrolled ? '1px solid rgba(255,255,255,0.1)' : undefined,
        borderRadius: scrolled ? 980 : 0,
        boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.5)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', boxSizing: 'border-box',
        transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em' }}>PRIME</span>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em' }}>KEYS</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              textDecoration: 'none', fontSize: 13, fontWeight: 400,
              color: isActive(link.href) ? '#fff' : 'rgba(255,255,255,0.5)',
              transition: 'color 0.2s', letterSpacing: '-0.01em',
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <CurrencyPicker />
          <div style={{ display: 'flex' }}>
            {!user ? (
              <Link href="/auth" style={{
                textDecoration: 'none', fontSize: 13, fontWeight: 400,
                color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.01em',
              }}>
                Sign In
              </Link>
            ) : (
              <UserProfileDropdown
                user={{
                  name: user.displayName || user.email?.split('@')[0] || 'User',
                  handle: `@${user.email?.split('@')[0] || 'user'}`,
                  avatarUrl: user.photoURL || '',
                }}
                actions={dropdownActions}
                menuItems={dropdownMenu}
                onSignOut={async () => { await signOut(); router.push('/') }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
