'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PRODUCTS, TEAM_ROLES } from '@primekeys/shared'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IdentityCard,
  TierProgressBar,
  getClientTier,
  type CardTier
} from '@/components/ui/identity-card'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

// ─── Founder email (1 of 1) ───────────────────────────────────────────────────
const FOUNDER_EMAIL  = 'aaronjthomas.cj@gmail.com'
const COFOUNDER_EMAIL = 'nicholsonvargheese81939@gmail.com'

// Team member accent colors
const TEAM_COLORS: Record<string, string> = {
  'devikaprasannan089@gmail.com': '#06b6d4',
  'shayanika7@gmail.com':         '#ec4899',
}

// ─── Mock subscriptions ───────────────────────────────────────────────────────
const MOCK_SUBS = [
  {
    id: 'mock-1',
    service: 'netflix',
    status: 'active',
    expiryDate: '2025-08-15T00:00:00.000Z',
    plan: '3 Months',
    credentials: { email: 'demo@netflix.com', password: 'NetflixPass2025!' },
  },
  {
    id: 'mock-2',
    service: 'chatgpt',
    status: 'active',
    expiryDate: '2025-07-01T00:00:00.000Z',
    plan: '1 Month',
    credentials: { email: 'demo@openai.com', password: 'GPTPass2025!' },
  },
  {
    id: 'mock-3',
    service: 'spotify',
    status: 'expired',
    expiryDate: '2025-02-28T00:00:00.000Z',
    plan: '1 Month',
    credentials: null,
  },
]

// ─── Resolve card tier from user data ─────────────────────────────────────────
function resolveCardTier(email: string | null | undefined, role: string | null, refCount: number): CardTier {
  if (!email) return 'bronze'
  if (email === FOUNDER_EMAIL) return 'legendary'
  if (email === COFOUNDER_EMAIL) return 'founder'
  if (TEAM_COLORS[email] || (role && role !== 'client')) return 'team'
  return getClientTier(refCount)
}

// ─── Sub card component ───────────────────────────────────────────────────────
function SubCard({ sub }: { sub: typeof MOCK_SUBS[0] }) {
  const [showCreds, setShowCreds] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const p = PRODUCTS.find(pr => pr.id === sub.service)
  const isExpired = sub.status === 'expired'

  const copy = (val: string, field: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const daysLeft = () => Math.max(0, Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / 86400000))

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
      background: isExpired ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)',
      border: isExpired ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, overflow: 'hidden', opacity: isExpired ? 0.6 : 1,
    }}>
      {!isExpired && <div style={{ height: 2, background: `linear-gradient(to right, ${p?.color || '#D4AF37'}, transparent)` }} />}
      <div style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${p?.color || '#333'}cc, ${p?.color || '#333'}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 20, flexShrink: 0,
              boxShadow: `0 0 16px ${p?.color || '#333'}40`,
            }}>
              {p?.name.charAt(0) || sub.service[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#f5f5f7', marginBottom: 5 }}>{p?.name || sub.service}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 980,
                  background: isExpired ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
                  border: `1px solid ${isExpired ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`,
                  fontSize: 10, fontWeight: 700, color: isExpired ? '#f87171' : '#4ade80', letterSpacing: '0.06em',
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: isExpired ? '#f87171' : '#4ade80', boxShadow: isExpired ? 'none' : '0 0 5px #4ade80' }} />
                  {isExpired ? 'EXPIRED' : 'ACTIVE'}
                </span>
                {sub.plan && <span style={{ padding: '2px 9px', borderRadius: 980, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 10, color: '#555', fontWeight: 500 }}>{sub.plan}</span>}
                <span style={{ fontSize: 11, color: '#555' }}>
                  {isExpired ? 'Expired' : `${daysLeft()}D LEFT`} · {new Date(sub.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button style={{ height: 34, padding: '0 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1a6', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.15)'; el.style.color = '#f5f5f7' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = '#a1a1a6' }}>
              Support
            </button>
            <button style={{ height: 34, padding: '0 14px', borderRadius: 9, background: `linear-gradient(135deg, ${p?.color || '#D4AF37'}, ${p?.color || '#C49A20'}aa)`, border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: `0 0 12px ${p?.color || '#D4AF37'}40` }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              {isExpired ? 'Reactivate' : 'Renew'}
            </button>
          </div>
        </div>

        {sub.credentials && !isExpired && (
          <div style={{ marginTop: 14 }}>
            <button onClick={() => setShowCreds(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showCreds ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
              {showCreds ? 'Hide' : 'Show'} credentials
            </button>
            <AnimatePresence>
              {showCreds && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                  <div style={{ marginTop: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
                    {(['email', 'password'] as const).map(f => (
                      <div key={f}>
                        <p style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>{f}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 13, color: '#a1a1a6', fontFamily: 'monospace' }}>{sub.credentials![f]}</span>
                          <button onClick={() => copy(sub.credentials![f], f)} style={{ padding: '2px 7px', borderRadius: 5, background: copied === f ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied === f ? 'rgba(74,222,128,0.28)' : 'rgba(255,255,255,0.08)'}`, color: copied === f ? '#4ade80' : '#555', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                            {copied === f ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    ))}
                    {DEV_BYPASS && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#D4AF37', opacity: 0.5 }}>Mock creds</span>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 90, borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }} />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClientPortal() {
  const { user, userData, role, loading, signOut } = useAuth()
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
  const [isLoadingSubs, setIsLoadingSubs] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  useEffect(() => {
    if (DEV_BYPASS) {
      setTimeout(() => { setSubs(MOCK_SUBS); setIsLoadingSubs(false) }, 700)
      return
    }
    if (!user) return
    const fetch = async () => {
      try {
        const q = query(collection(db, 'clients'), where('email', '==', user.email))
        const snap = await getDocs(q)
        setSubs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) { console.error(err) }
      finally { setIsLoadingSubs(false) }
    }
    fetch()
  }, [user])

  if (loading || (!user && !loading)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) }}`}</style>
      </div>
    )
  }

  const email = user?.email
  const refCount = userData?.refCount ?? 0
  const cardTier = resolveCardTier(email, role, refCount)
  const teamEntry = email ? TEAM_ROLES[email as keyof typeof TEAM_ROLES] : null
  const cardTitle = teamEntry?.title || userData?.role || 'Member'
  const cardName  = userData?.name || user?.displayName || 'User'
  const accentColor = email ? TEAM_COLORS[email] : undefined
  const isClient = cardTier === 'bronze' || cardTier === 'silver' || cardTier === 'gold' || cardTier === 'elite-gold'

  const activeSubs  = subs.filter(s => s.status === 'active')
  const expiredSubs = subs.filter(s => s.status !== 'active')

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* DEV banner */}
        {DEV_BYPASS && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
            marginBottom: 28, padding: '9px 16px',
            background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#D4AF37', letterSpacing: '0.18em', padding: '2px 7px', background: 'rgba(212,175,55,0.12)', borderRadius: 5 }}>DEV PREVIEW</span>
            <span style={{ fontSize: 12, color: '#555' }}>Mock data · set <code style={{ fontSize: 11, color: '#888', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 4 }}>NEXT_PUBLIC_DEV_BYPASS=false</code> for real auth</span>
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 7 }}>My Account</p>
            <h1 style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Welcome back,{' '}
              <span style={{ color: '#D4AF37' }}>{cardName.split(' ')[0]}</span>
            </h1>
            <p style={{ fontSize: 13, color: '#555', marginTop: 7 }}>
              {activeSubs.length} active subscription{activeSubs.length !== 1 ? 's' : ''} · {email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            {userData?.role !== 'client' && (
              <Link href="/portal/admin" style={{ height: 38, padding: '0 16px', borderRadius: 9, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', background: 'rgba(255,60,60,0.07)', border: '1px solid rgba(255,60,60,0.22)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                Admin Panel
              </Link>
            )}
            <button onClick={async () => { await signOut(); router.push('/') }} style={{ height: 38, padding: '0 16px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#666', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#f5f5f7'; el.style.borderColor = 'rgba(255,255,255,0.14)' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.color = '#666'; el.style.borderColor = 'rgba(255,255,255,0.07)' }}>
              Sign Out
            </button>
          </div>
        </motion.div>

        <hr style={{ border: 'none', height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.15), transparent)', marginBottom: 36 }} />

        {/* 2-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 28, alignItems: 'start' }}>

          {/* ── Subscriptions ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7' }}>
                My Subscriptions
                {!isLoadingSubs && <span style={{ marginLeft: 7, fontSize: 12, color: '#444', fontWeight: 400 }}>{subs.length} total</span>}
              </h2>
              <Link href="/store" style={{ display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 12px', borderRadius: 7, textDecoration: 'none', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)', color: '#D4AF37', fontSize: 11, fontWeight: 600 }}>
                + Add subscription
              </Link>
            </div>

            {isLoadingSubs ? <Skeleton /> : subs.length === 0 ? (
              <div style={{ padding: '52px 28px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 300, color: '#222', marginBottom: 14 }}>◈</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#f5f5f7', marginBottom: 6 }}>No subscriptions yet</p>
                <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>Browse our store and get your first plan delivered in minutes.</p>
                <Link href="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 42, padding: '0 22px', borderRadius: 980, textDecoration: 'none', background: 'linear-gradient(135deg, #D4AF37, #C49A20)', color: '#000', fontWeight: 700, fontSize: 13 }}>
                  Explore Store
                </Link>
              </div>
            ) : (
              <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...activeSubs, ...expiredSubs].map((sub, i) => (
                  <motion.div key={sub.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <SubCard sub={sub} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── IDENTITY CARD ── */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                Your PRIMEKEYS Card
              </p>
              <IdentityCard
                name={cardName}
                title={cardTitle}
                tier={cardTier}
                refCount={refCount}
                accentColor={accentColor}
              />
              {isClient && <TierProgressBar refCount={refCount} />}
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Active plans',     value: activeSubs.length, color: '#4ade80' },
                { label: 'Friends referred', value: refCount,           color: '#D4AF37' },
              ].map(s => (
                <div key={s.label} style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── Refer card ── */}
            <div style={{ padding: 20, borderRadius: 18, background: 'linear-gradient(135deg, rgba(212,175,55,0.07), rgba(212,175,55,0.02))', border: '1px solid rgba(212,175,55,0.16)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: '#D4AF37', opacity: 0.05, filter: 'blur(20px)', pointerEvents: 'none' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#D4AF37', marginBottom: 5 }}>✦ Refer & Earn</p>
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.65, marginBottom: 14 }}>
                Invite friends — get <strong style={{ color: '#a1a1a6' }}>10% off</strong> each renewal, no limit. Your code: <code style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{userData?.refCode || 'PRIMEKEYS'}</code>
              </p>
              <button style={{ width: '100%', height: 36, borderRadius: 9, background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                Get Invite Link
              </button>
            </div>

            {/* ── WhatsApp ── */}
            <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 13, textDecoration: 'none', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.16)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(37,211,102,0.32)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(37,211,102,0.16)')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#25D366' }}>WhatsApp Support</p>
                <p style={{ fontSize: 10, color: '#555' }}>Typically replies in &lt; 5 min</p>
              </div>
            </a>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
