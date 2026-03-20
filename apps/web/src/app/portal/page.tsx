'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { PRODUCTS, TEAM_ROLES } from '@primekeys/shared'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Check, X, Edit3 } from 'lucide-react'
import {
  IdentityCard,
  TierProgressBar,
  getClientTier,
  type CardTier
} from '@/components/ui/identity-card'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

const FOUNDER_EMAIL   = 'aaronjthomas.cj@gmail.com'
const COFOUNDER_EMAIL = 'nicholsonvargheese81939@gmail.com'

const TEAM_COLORS: Record<string, string> = {
  'devikaprasannan089@gmail.com': '#06b6d4',
  'shayanika7@gmail.com':         '#ec4899',
}

const MOCK_SUBS = [
  { id: 'mock-1', service: 'netflix',  status: 'active',  expiryDate: '2025-08-15T00:00:00.000Z', plan: '3 Months', credentials: { email: 'demo@netflix.com', password: 'NetflixPass2025!' } },
  { id: 'mock-2', service: 'chatgpt',  status: 'active',  expiryDate: '2025-07-01T00:00:00.000Z', plan: '1 Month',  credentials: { email: 'demo@openai.com',   password: 'GPTPass2025!'     } },
  { id: 'mock-3', service: 'spotify',  status: 'expired', expiryDate: '2025-02-28T00:00:00.000Z', plan: '1 Month',  credentials: null },
]

// ── Mobile detection hook ─────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function resolveCardTier(email: string | null | undefined, role: string | null, refCount: number): CardTier {
  if (!email) return 'bronze'
  if (email === FOUNDER_EMAIL) return 'legendary'
  if (email === COFOUNDER_EMAIL) return 'founder'
  if (TEAM_COLORS[email] || (role && role !== 'client')) return 'team'
  return getClientTier(refCount)
}

// ── Edit Profile Modal ────────────────────────────────────
function EditProfileModal({ user, onClose, onSaved }: { user: any; onClose: () => void; onSaved: (name: string, photoURL: string) => void }) {
  const [name, setName] = useState(user?.displayName || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return }
    setUploading(true); setError(null)
    try {
      const reader = new FileReader()
      reader.onload = () => setPhotoURL(reader.result as string)
      reader.onerror = () => setError('Failed to read image')
      reader.readAsDataURL(file)
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty'); return }
    setSaving(true); setError(null)
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name.trim(), photoURL: photoURL || null })
      onSaved(name.trim(), photoURL); onClose()
    } catch { setError('Failed to save. Please try again.') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f5f5f7' }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: photoURL ? 'transparent' : 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photoURL
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 28, fontWeight: 800, color: '#D4AF37' }}>{name.charAt(0).toUpperCase() || '?'}</span>
              }
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={13} color="#000" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#555', marginTop: -16, marginBottom: 20 }}>Tap to change photo · Max 2MB</p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#a1a1a6', display: 'block', marginBottom: 7 }}>Display Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
            style={{ width: '100%', height: 44, padding: '0 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: '#f5f5f7', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>{error}</p>}
        <button onClick={handleSave} disabled={saving || uploading}
          style={{ width: '100%', height: 46, background: saving ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37, #A8842A)', color: '#000', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {saving ? <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><Check size={15} />Save Changes</>}
        </button>
      </motion.div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Sub card ──────────────────────────────────────────────
function SubCard({ sub }: { sub: typeof MOCK_SUBS[0] }) {
  const [showCreds, setShowCreds] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const p = PRODUCTS.find(pr => pr.id === sub.service)
  const isExpired = sub.status === 'expired'

  const copy = (val: string, field: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
    setCopied(field); setTimeout(() => setCopied(null), 2000)
  }

  const daysLeft = () => Math.max(0, Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / 86400000))

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: isExpired ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)', border: isExpired ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', opacity: isExpired ? 0.6 : 1 }}>
      {!isExpired && <div style={{ height: 2, background: `linear-gradient(to right, ${p?.color || '#D4AF37'}, transparent)` }} />}
      <div style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${p?.color || '#333'}cc, ${p?.color || '#333'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18, flexShrink: 0, boxShadow: `0 0 16px ${p?.color || '#333'}40` }}>
              {p?.name.charAt(0) || sub.service[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#f5f5f7', marginBottom: 4 }}>{p?.name || sub.service}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 980, background: isExpired ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', border: `1px solid ${isExpired ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`, fontSize: 9, fontWeight: 700, color: isExpired ? '#f87171' : '#4ade80', letterSpacing: '0.06em' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: isExpired ? '#f87171' : '#4ade80', boxShadow: isExpired ? 'none' : '0 0 5px #4ade80' }} />
                  {isExpired ? 'EXPIRED' : 'ACTIVE'}
                </span>
                {sub.plan && <span style={{ padding: '2px 8px', borderRadius: 980, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 9, color: '#555', fontWeight: 500 }}>{sub.plan}</span>}
                <span style={{ fontSize: 10, color: '#555' }}>
                  {isExpired ? 'Expired' : `${daysLeft()}D LEFT`} · {new Date(sub.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            <button style={{ height: 32, padding: '0 12px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1a6', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Support</button>
            <button style={{ height: 32, padding: '0 12px', borderRadius: 9, background: `linear-gradient(135deg, ${p?.color || '#D4AF37'}, ${p?.color || '#C49A20'}aa)`, border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {isExpired ? 'Reactivate' : 'Renew'}
            </button>
          </div>
        </div>

        {sub.credentials && !isExpired && (
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setShowCreds(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showCreds ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}><path d="M6 9l6 6 6-6"/></svg>
              {showCreds ? 'Hide' : 'Show'} credentials
            </button>
            <AnimatePresence>
              {showCreds && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                  <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                    {(['email', 'password'] as const).map(f => (
                      <div key={f}>
                        <p style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>{f}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 12, color: '#a1a1a6', fontFamily: 'monospace', wordBreak: 'break-all' }}>{sub.credentials![f]}</span>
                          <button onClick={() => copy(sub.credentials![f], f)} style={{ padding: '2px 7px', borderRadius: 5, background: copied === f ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied === f ? 'rgba(74,222,128,0.28)' : 'rgba(255,255,255,0.08)'}`, color: copied === f ? '#4ade80' : '#555', fontSize: 10, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                            {copied === f ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    ))}
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
      {[1, 2, 3].map(i => <div key={i} style={{ height: 90, borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }} />)}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function ClientPortal() {
  const { user, userData, role, loading, signOut } = useAuth()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [subs, setSubs] = useState<any[]>([])
  const [isLoadingSubs, setIsLoadingSubs] = useState(true)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState('')

  useEffect(() => { if (!loading && !user) router.push('/auth') }, [user, loading, router])

  useEffect(() => {
    if (user) { setDisplayName(user.displayName || userData?.name || 'User'); setPhotoURL(user.photoURL || '') }
  }, [user, userData])

  useEffect(() => {
    if (DEV_BYPASS) { setTimeout(() => { setSubs(MOCK_SUBS); setIsLoadingSubs(false) }, 700); return }
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
  const cardName  = displayName || userData?.name || user?.displayName || 'User'
  const accentColor = email ? TEAM_COLORS[email] : undefined
  const isClient = cardTier === 'bronze' || cardTier === 'silver' || cardTier === 'gold' || cardTier === 'elite-gold'
  const activeSubs  = subs.filter(s => s.status === 'active')
  const expiredSubs = subs.filter(s => s.status !== 'active')

  // Mobile: no x-axis animations (saves GPU), faster duration
  const motionConfig = isMobile
    ? { duration: 0.25, ease: [0.22, 1, 0.36, 1] as any }
    : { duration: 0.5,  ease: [0.22, 1, 0.36, 1] as any }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Background glow — reduced opacity on mobile via inline */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.06) 0%, transparent 70%)', opacity: isMobile ? 0.4 : 1 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: isMobile ? '72px 16px 60px' : '80px 24px 80px' }}>

        {DEV_BYPASS && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 28, padding: '9px 16px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#D4AF37', letterSpacing: '0.18em', padding: '2px 7px', background: 'rgba(212,175,55,0.12)', borderRadius: 5 }}>DEV PREVIEW</span>
            <span style={{ fontSize: 12, color: '#555' }}>Mock data · set <code style={{ fontSize: 11, color: '#888', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 4 }}>NEXT_PUBLIC_DEV_BYPASS=false</code> for real auth</span>
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={motionConfig}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, borderRadius: '50%', background: photoURL ? 'transparent' : 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photoURL
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#D4AF37' }}>{cardName.charAt(0).toUpperCase()}</span>
                }
              </div>
              <button onClick={() => setShowEditProfile(true)}
                style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: '#D4AF37', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit3 size={11} color="#000" />
              </button>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>My Account</p>
              <h1 style={{ fontSize: isMobile ? 22 : 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Welcome back, <span style={{ color: '#D4AF37' }}>{cardName.split(' ')[0]}</span>
              </h1>
              <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                {activeSubs.length} active subscription{activeSubs.length !== 1 ? 's' : ''} · {email}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {userData?.role !== 'client' && (
              <Link href="/portal/admin" style={{ height: 36, padding: '0 14px', borderRadius: 9, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', background: 'rgba(255,60,60,0.07)', border: '1px solid rgba(255,60,60,0.22)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                Admin Panel
              </Link>
            )}
            <button onClick={() => setShowEditProfile(true)}
              style={{ height: 36, padding: '0 14px', borderRadius: 9, background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Edit3 size={13} />Edit Profile
            </button>
            <button onClick={async () => { await signOut(); router.push('/') }}
              style={{ height: 36, padding: '0 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#666', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </motion.div>

        <hr style={{ border: 'none', height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.15), transparent)', marginBottom: 28 }} />

        {/* ── LAYOUT: single column on mobile, 2-col on desktop ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 320px',
          gap: isMobile ? 24 : 28,
          alignItems: 'start',
        }}>

          {/* On mobile — show card FIRST, then subscriptions */}
          {isMobile && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionConfig, delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Your PRIMEKEYS Card</p>
                <IdentityCard name={cardName} title={cardTitle} tier={cardTier} refCount={refCount} accentColor={accentColor} />
                {isClient && <TierProgressBar refCount={refCount} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Active plans',     value: activeSubs.length, color: '#4ade80' },
                  { label: 'Friends referred', value: refCount,           color: '#D4AF37' },
                ].map(s => (
                  <div key={s.label} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Subscriptions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={motionConfig}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7' }}>
                My Subscriptions
                {!isLoadingSubs && <span style={{ marginLeft: 7, fontSize: 12, color: '#444', fontWeight: 400 }}>{subs.length} total</span>}
              </h2>
              <Link href="/store" style={{ display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 12px', borderRadius: 7, textDecoration: 'none', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)', color: '#D4AF37', fontSize: 11, fontWeight: 600 }}>
                + Add
              </Link>
            </div>

            {isLoadingSubs ? <Skeleton /> : subs.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 20 }}>
                <div style={{ fontSize: 28, fontWeight: 300, color: '#222', marginBottom: 12 }}>◈</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7', marginBottom: 6 }}>No subscriptions yet</p>
                <p style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Browse our store and get your first plan delivered in minutes.</p>
                <Link href="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 42, padding: '0 22px', borderRadius: 980, textDecoration: 'none', background: 'linear-gradient(135deg, #D4AF37, #C49A20)', color: '#000', fontWeight: 700, fontSize: 13 }}>
                  Explore Store
                </Link>
              </div>
            ) : (
              <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...activeSubs, ...expiredSubs].map((sub, i) => (
                  <motion.div key={sub.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * (isMobile ? 0.04 : 0.07) }}>
                    <SubCard sub={sub} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar — desktop only (mobile version rendered above) */}
          {!isMobile && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Your PRIMEKEYS Card</p>
                <IdentityCard name={cardName} title={cardTitle} tier={cardTier} refCount={refCount} accentColor={accentColor} />
                {isClient && <TierProgressBar refCount={refCount} />}
              </div>

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

              <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 13, textDecoration: 'none', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.16)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#25D366' }}>WhatsApp Support</p>
                  <p style={{ fontSize: 10, color: '#555' }}>Typically replies in &lt; 5 min</p>
                </div>
              </a>
            </motion.div>
          )}

          {/* Mobile bottom — Refer & Earn + WhatsApp */}
          {isMobile && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionConfig, delay: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 18, borderRadius: 16, background: 'linear-gradient(135deg, rgba(212,175,55,0.07), rgba(212,175,55,0.02))', border: '1px solid rgba(212,175,55,0.16)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#D4AF37', marginBottom: 5 }}>✦ Refer & Earn</p>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.65, marginBottom: 12 }}>
                  Invite friends — get <strong style={{ color: '#a1a1a6' }}>10% off</strong> each renewal. Your code: <code style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{userData?.refCode || 'PRIMEKEYS'}</code>
                </p>
                <button style={{ width: '100%', height: 38, borderRadius: 10, background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Get Invite Link
                </button>
              </div>
              <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 13, textDecoration: 'none', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.16)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#25D366' }}>WhatsApp Support</p>
                  <p style={{ fontSize: 10, color: '#555' }}>Typically replies in &lt; 5 min</p>
                </div>
              </a>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showEditProfile && (
          <EditProfileModal
            user={user}
            onClose={() => setShowEditProfile(false)}
            onSaved={(name, photo) => { setDisplayName(name); setPhotoURL(photo) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}