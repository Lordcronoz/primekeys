'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, RefreshCw, Ban, Copy, Check, StickyNote } from 'lucide-react'
import { PRODUCTS } from '@primekeys/shared'
import { db } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ClientRecord {
  id: string
  number: string
  name: string
  email: string
  whatsapp?: string
  dob?: string
  region?: string
  tier: 'legendary' | 'founder' | 'team' | 'elite-gold' | 'gold' | 'silver' | 'bronze'
  services: string[]           // product ids
  refCount: number
  refCode?: string
  expiryDate: string
  status: 'active' | 'expired' | 'suspended'
  notes?: string
  joinDate?: string
}

interface ClientManagementTableProps {
  clients?: ClientRecord[]
  loading?: boolean
  onStatusChange?: (id: string, status: ClientRecord['status']) => void
  onNotesChange?: (id: string, notes: string) => void
}

// ─── Mock data ────────────────────────────────────────────────────────────────
export const MOCK_CLIENTS: ClientRecord[] = [
  {
    id: 'c1', number: '01',
    name: 'Riya Sharma', email: 'riya.sharma@gmail.com', whatsapp: '919876543210',
    dob: '1999-03-13', region: 'IN',
    tier: 'gold', services: ['netflix', 'spotify'], refCount: 11,
    refCode: 'RIYA11', expiryDate: '2025-08-15', status: 'active',
    joinDate: '2024-09-01', notes: '',
  },
  {
    id: 'c2', number: '02',
    name: 'Aditya Menon', email: 'aditya.m@outlook.com', whatsapp: '919123456789',
    dob: '2001-06-21', region: 'IN',
    tier: 'silver', services: ['chatgpt'], refCount: 6,
    refCode: 'ADITYA6', expiryDate: '2025-07-01', status: 'active',
    joinDate: '2024-11-15', notes: '',
  },
  {
    id: 'c3', number: '03',
    name: 'Fatima Al-Hassan', email: 'fatima.h@hotmail.com', whatsapp: '971501234567',
    dob: '1995-11-05', region: 'AE',
    tier: 'elite-gold', services: ['netflix', 'chatgpt', 'spotify'], refCount: 16,
    refCode: 'FATIMA16', expiryDate: '2025-09-30', status: 'active',
    joinDate: '2024-07-20', notes: 'Prefers communication in English, pays via Wise',
  },
  {
    id: 'c4', number: '04',
    name: 'Karan Nair', email: 'karan.nair@gmail.com', whatsapp: '919988776655',
    dob: '2000-01-30', region: 'IN',
    tier: 'bronze', services: ['youtube'], refCount: 2,
    refCode: 'KARAN2', expiryDate: '2025-03-28', status: 'expired',
    joinDate: '2025-01-10', notes: '',
  },
  {
    id: 'c5', number: '05',
    name: 'Sarah Mitchell', email: 'sarah.m@gmail.com', whatsapp: '14155550123',
    dob: '1997-07-19', region: 'US',
    tier: 'gold', services: ['canva', 'netflix'], refCount: 10,
    refCode: 'SARAH10', expiryDate: '2025-04-12', status: 'suspended',
    joinDate: '2024-10-05', notes: 'Disputed charge — on hold until resolved',
  },
]

// ─── Tier visuals ─────────────────────────────────────────────────────────────
const TIER_COLOR: Record<ClientRecord['tier'], { bg: string; text: string; label: string }> = {
  legendary:    { bg: 'rgba(212,175,55,0.18)',  text: '#D4AF37', label: '✦ LEGENDARY' },
  founder:      { bg: 'rgba(139,92,246,0.18)',  text: '#a78bfa', label: '◈ FOUNDER'   },
  team:         { bg: 'rgba(56,189,248,0.18)',  text: '#38bdf8', label: '▲ TEAM'      },
  'elite-gold': { bg: 'rgba(251,191,36,0.18)',  text: '#fbbf24', label: '◈ ELITE'     },
  gold:         { bg: 'rgba(212,175,55,0.12)',  text: '#f5d060', label: '■ GOLD'      },
  silver:       { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', label: '■ SILVER'    },
  bronze:       { bg: 'rgba(180,83,9,0.12)',    text: '#d97706', label: '■ BRONZE'    },
}

// ─── Service dot ──────────────────────────────────────────────────────────────
function ServiceDots({ ids }: { ids: string[] }) {
  const products = ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean)
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
      {products.map(p => (
        <div key={p!.id} title={p!.name} style={{
          width: 22, height: 22, borderRadius: 6,
          background: p!.color + '22',
          border: `1px solid ${p!.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800, color: p!.color,
        }}>
          {p!.name.charAt(0)}
        </div>
      ))}
    </div>
  )
}

// ─── Ref bars ─────────────────────────────────────────────────────────────────
function RefBars({ count }: { count: number }) {
  const max = 15
  const filled = Math.min(count, max)
  const bars = Math.ceil(max / 3) // 5 bars representing 0-15
  const filledBars = Math.round((filled / max) * bars)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: bars }).map((_, i) => (
          <div key={i} style={{
            width: 6, height: 18, borderRadius: 3,
            background: i < filledBars ? '#D4AF37' : 'rgba(255,255,255,0.07)',
            boxShadow: i < filledBars ? '0 0 4px rgba(212,175,55,0.4)' : 'none',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>{count}</span>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ClientRecord['status'] }) {
  const map = {
    active:    { bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.25)',  color: '#4ade80', dot: '#4ade80' },
    expired:   { bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)', color: '#f87171', dot: '#f87171' },
    suspended: { bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)',  color: '#fbbf24', dot: '#fbbf24' },
  }
  const s = map[status]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 980, background: s.bg, border: `1px solid ${s.border}` }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: s.dot, boxShadow: status === 'active' ? `0 0 5px ${s.dot}` : 'none' }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '0.06em' }}>{status.toUpperCase()}</span>
    </div>
  )
}

// ─── Days until expiry ────────────────────────────────────────────────────────
function ExpiryDisplay({ date, status }: { date: string; status: ClientRecord['status'] }) {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  const display = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
  const urgent = days >= 0 && days <= 7 && status === 'active'
  return (
    <div>
      <span style={{ fontSize: 12, color: urgent ? '#fbbf24' : '#a1a1a6' }}>{display}</span>
      {urgent && <span style={{ marginLeft: 5, fontSize: 9, color: '#fbbf24', fontWeight: 700 }}>{days}D LEFT</span>}
      {status === 'expired' && <span style={{ marginLeft: 5, fontSize: 9, color: '#f87171', fontWeight: 700 }}>EXPIRED</span>}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ClientManagementTable({
  clients: initialClients = MOCK_CLIENTS,
  loading = false,
  onStatusChange,
  onNotesChange,
}: ClientManagementTableProps) {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients)
  const [selected, setSelected] = useState<ClientRecord | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | ClientRecord['status']>('all')
  const [filterTier, setFilterTier] = useState<'all' | ClientRecord['tier']>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => { setClients(initialClients) }, [initialClients])

  // Sync selected when clients update
  useEffect(() => {
    if (selected) {
      const updated = clients.find(c => c.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [clients])

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    const matchTier   = filterTier === 'all' || c.tier === filterTier
    return matchSearch && matchStatus && matchTier
  })

  const handleStatus = async (id: string, status: ClientRecord['status']) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    onStatusChange?.(id, status)
    try {
      await updateDoc(doc(db, 'clients', id), { status, updatedAt: serverTimestamp() })
    } catch (e) { console.warn('Status update failed (may not be in Firestore):', e) }
  }

  const handleSaveNotes = async () => {
    if (!selected) return
    setSavingNotes(true)
    setClients(prev => prev.map(c => c.id === selected.id ? { ...c, notes: editNotes } : c))
    onNotesChange?.(selected.id, editNotes)
    try {
      await updateDoc(doc(db, 'clients', selected.id), { notes: editNotes, updatedAt: serverTimestamp() })
    } catch (e) { console.warn('Notes update failed (may not be in Firestore):', e) }
    finally { setSavingNotes(false) }
  }

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const openModal = (c: ClientRecord) => { setSelected(c); setEditNotes(c.notes || '') }

  const activeCount   = clients.filter(c => c.status === 'active').length
  const expiredCount  = clients.filter(c => c.status === 'expired').length
  const suspendCount  = clients.filter(c => c.status === 'suspended').length

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            style={{
              width: '100%', height: 36, padding: '0 12px 0 34px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: '#f5f5f7', fontSize: 13, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
          <svg style={{ position: 'absolute', left: 10, top: 10, opacity: 0.3 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        {/* Status filter */}
        {(['all', 'active', 'expired', 'suspended'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            height: 32, padding: '0 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
            background: filterStatus === s ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
            color: filterStatus === s ? '#D4AF37' : '#555',
            transition: 'all 0.15s',
          }}>{s === 'all' ? `All (${clients.length})` : s === 'active' ? `Active (${activeCount})` : s === 'expired' ? `Expired (${expiredCount})` : `Suspended (${suspendCount})`}</button>
        ))}
      </div>

      {/* ── Table container ── */}
      <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', position: 'relative' }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 100px 110px 100px 90px 90px', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(10px)', zIndex: 2 }}>
          {['#', 'CLIENT', 'SERVICES', 'EXPIRY', 'REFS', 'STATUS', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 9, fontWeight: 700, color: '#444', letterSpacing: '0.12em', textAlign: i === 5 ? 'center' : 'left' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 13 }}>Loading clients…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#444', fontSize: 13 }}>No clients match your filter.</div>
        ) : (
          <motion.div
            variants={{ visible: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } } }}
            initial="hidden" animate="visible"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {filtered.map(client => {
              const tier = TIER_COLOR[client.tier]
              return (
                <motion.div
                  key={client.id}
                  variants={{
                    hidden: { opacity: 0, x: -18, filter: 'blur(4px)' },
                    visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 380, damping: 28 } },
                  }}
                  onClick={() => openModal(client)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                >
                  <div style={{
                    display: 'grid', gridTemplateColumns: '44px 1fr 100px 110px 100px 90px 90px',
                    gap: 12, padding: '14px 20px', alignItems: 'center',
                  }}>
                    {/* # */}
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#222' }}>{client.number}</span>

                    {/* Client */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: tier.bg, border: `1px solid ${tier.text}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: tier.text,
                      }}>{client.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7', marginBottom: 2 }}>{client.name}</p>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: tier.bg, color: tier.text, fontWeight: 700, letterSpacing: '0.06em' }}>{tier.label}</span>
                          <span style={{ fontSize: 10, color: '#444', fontFamily: 'monospace' }}>{client.email.split('@')[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    <ServiceDots ids={client.services} />

                    {/* Expiry */}
                    <ExpiryDisplay date={client.expiryDate} status={client.status} />

                    {/* Refs */}
                    <RefBars count={client.refCount} />

                    {/* Status */}
                    <div style={{ textAlign: 'center' }}><StatusBadge status={client.status} /></div>

                    {/* Arrow */}
                    <div style={{ textAlign: 'right', color: '#333', fontSize: 14 }}>›</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* ── Modal overlay ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', borderRadius: 18, zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              {/* Modal header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(8,8,8,0.6)' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: TIER_COLOR[selected.tier].bg,
                  border: `1px solid ${TIER_COLOR[selected.tier].text}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900, color: TIER_COLOR[selected.tier].text,
                }}>{selected.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#f5f5f7' }}>{selected.name}</p>
                  <p style={{ fontSize: 11, color: '#555' }}>{selected.email} · {selected.region}</p>
                </div>
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1a6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Email', value: selected.email, mono: true, copyKey: 'email' },
                    { label: 'WhatsApp', value: selected.whatsapp ? `+${selected.whatsapp}` : '—', mono: true, copyKey: 'wa' },
                    { label: 'Birthday', value: selected.dob ? new Date(selected.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : '—', mono: false, copyKey: '' },
                    { label: 'Joined', value: selected.joinDate ? new Date(selected.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—', mono: false, copyKey: '' },
                    { label: 'Expiry', value: new Date(selected.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), mono: false, copyKey: '' },
                    { label: 'Ref Code', value: selected.refCode || '—', mono: true, copyKey: 'ref' },
                  ].map(({ label, value, mono, copyKey }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#a1a1a6', fontFamily: mono ? 'monospace' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                        {copyKey && value !== '—' && (
                          <button onClick={() => copy(value, copyKey)} style={{ flexShrink: 0, color: copied === copyKey ? '#4ade80' : '#444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            {copied === copyKey ? <Check size={11} /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Services */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Active Services</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selected.services.map(id => {
                      const p = PRODUCTS.find(x => x.id === id)
                      if (!p) return null
                      return (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: `${p.color}15`, border: `1px solid ${p.color}33` }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                          <span style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.name}</span>
                        </div>
                      )
                    })}
                    {selected.services.length === 0 && <span style={{ color: '#444', fontSize: 12 }}>No active services</span>}
                  </div>
                </div>

                {/* Notes */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <StickyNote size={12} style={{ color: '#D4AF37' }} />
                    <p style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Team Notes (private)</p>
                  </div>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Add private notes about this client…"
                    rows={2}
                    style={{
                      width: '100%', background: 'transparent', border: 'none', resize: 'none',
                      color: '#a1a1a6', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                      lineHeight: 1.6, boxSizing: 'border-box',
                    }}
                  />
                  {editNotes !== (selected.notes || '') && (
                    <button onClick={handleSaveNotes} style={{ marginTop: 6, fontSize: 11, color: savingNotes ? '#4ade80' : '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      {savingNotes ? '✓ Saved' : 'Save notes'}
                    </button>
                  )}
                </div>

              </div>

              {/* Action buttons */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8, background: 'rgba(8,8,8,0.6)', flexWrap: 'wrap' }}>
                {/* WhatsApp */}
                {selected.whatsapp && (
                  <a href={`https://wa.me/${selected.whatsapp}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, textDecoration: 'none', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366', fontSize: 12, fontWeight: 600 }}>
                    <MessageCircle size={13} />Message
                  </a>
                )}
                {/* Renew */}
                {selected.status !== 'active' && (
                  <button onClick={() => handleStatus(selected.id, 'active')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <RefreshCw size={13} />Reactivate
                  </button>
                )}
                {/* Suspend */}
                {selected.status === 'active' && (
                  <button onClick={() => handleStatus(selected.id, 'suspended')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Ban size={13} />Suspend
                  </button>
                )}
                {/* Copy Email */}
                <button onClick={() => copy(selected.email, 'modal-email')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: copied === 'modal-email' ? '#4ade80' : '#a1a1a6', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {copied === 'modal-email' ? <Check size={13} /> : <Copy size={13} />}
                  {copied === 'modal-email' ? 'Copied!' : 'Copy Email'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
