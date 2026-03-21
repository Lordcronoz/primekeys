'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, AlertTriangle, Plus, X, Check, Copy } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore'
import { TEAM_ROLES } from '@primekeys/shared'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

// ── Phone numbers ─────────────────────────────────────────
// Each person can have multiple numbers — all will appear in the notify list
// Aaron has 2: company WA (customer-facing) + personal (internal)
// Format: 91 + 10 digit number, no spaces
const TEAM_PHONES: Record<string, Array<{ phone: string; label: string }>> = {
  'aaronjthomas.cj@gmail.com': [
    { phone: '918111956481',   label: 'Company WA'  },
    { phone: '919207516621', label: 'Personal'    }, // ← replace with your personal number
  ],
  'nicholsonvargheese81939@gmail.com': [
    { phone: '919847916693',       label: 'Personal'    }, // ← replace
  ],
  'devikaprasannan089@gmail.com': [
    { phone: '919037665893',      label: 'Personal'    }, // ← replace
  ],
  'shayanika7@gmail.com': [
    { phone: '917086233306',   label: 'Personal'    }, // ← replace
  ],
}
// ─────────────────────────────────────────────────────────

const SENDER       = 'Aaron Joy Thomas\nFounder & CEO\nSeraph Group of Companies'
const SENDER_SHORT = 'Aaron Joy Thomas | Founder & CEO | Seraph Group of Companies'

export interface MaintenanceWindow {
  id: string; title: string; desc: string
  scheduledFor: string; startTime: string; endTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  notifiedAt?: string; createdAt: number
}

const MOCK_MAINTENANCE: MaintenanceWindow[] = [
  { id: 'm1', title: 'Backend v2 Deploy', desc: 'Deploy new authenticated API endpoints.', scheduledFor: '2026-04-01', startTime: '02:00', endTime: '04:00', status: 'scheduled', createdAt: Date.now() - 86400000 },
  { id: 'm2', title: 'Database migration', desc: 'Migrating client records to new Firestore schema.', scheduledFor: '2026-02-20', startTime: '01:00', endTime: '03:00', status: 'completed', createdAt: Date.now() - 2592000000 },
]

function buildTeamMsg(name: string, title: string, date: string, start: string, end: string) {
  return `Hey ${name.split(' ')[0]}!\n\nPlanned Maintenance Notice from PRIMEKEYS:\n\n*${title}*\nDate: ${date}\nTime: ${start} – ${end} IST\n\nPlease be aware during this window. Thanks!\n\n— ${SENDER_SHORT}`
}

function buildClientMsg(title: string, date: string, start: string, end: string) {
  return `Hi!\n\nWe're scheduling a brief maintenance window:\n\n*${title}*\n${date} · ${start} – ${end} IST\n\nSome services may be briefly unavailable. We apologise for any inconvenience and will be back soon!\n\nThank you for your patience!\n\n— ${SENDER}`
}

const STATUS_STYLE: Record<MaintenanceWindow['status'], { color: string; bg: string }> = {
  scheduled: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  active:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  completed: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)'  },
  cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

const inputStyle: React.CSSProperties = {
  height: 36, padding: '0 12px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
  color: '#f5f5f7', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box',
}

function isReal(p: string) {
  return p && !p.toUpperCase().includes('YOUR') && !p.toUpperCase().includes('NICKS') &&
    !p.toUpperCase().includes('DEVIKA') && !p.toUpperCase().includes('SHAYANIKA') &&
    p.replace(/\D/g, '').length >= 10
}

export function MaintenanceSection() {
  const [windows, setWindows] = useState<MaintenanceWindow[]>(DEV_BYPASS ? MOCK_MAINTENANCE : [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', desc: '', scheduledFor: '', startTime: '01:00', endTime: '03:00' })
  const [bannerOn, setBannerOn] = useState(false)
  const [bannerSaving, setBannerSaving] = useState(false)
  const [showNotify, setShowNotify] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (DEV_BYPASS) return
    const q = query(collection(db, 'maintenance'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setWindows(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceWindow))))
  }, [])

  useEffect(() => {
    if (DEV_BYPASS) return
    getDoc(doc(db, 'maintenance', '_banner')).then(snap => {
      if (snap.exists()) setBannerOn(snap.data().active ?? false)
    }).catch(() => {})
  }, [])

  const toggleBanner = async () => {
    const next = !bannerOn
    setBannerOn(next)
    setBannerSaving(true)
    try {
      await setDoc(doc(db, 'maintenance', '_banner'), { active: next, updatedAt: serverTimestamp() })
    } catch (e) { console.error(e) }
    finally { setBannerSaving(false) }
  }

  const handleAdd = async () => {
    if (!form.title.trim() || !form.scheduledFor) return
    setAdding(true)
    try {
      const newW = { ...form, status: 'scheduled' as const, createdAt: Date.now() }
      if (DEV_BYPASS) setWindows(prev => [{ id: `m${Date.now()}`, ...newW }, ...prev])
      else await addDoc(collection(db, 'maintenance'), { ...newW, createdAt: serverTimestamp() })
      setShowForm(false)
      setForm({ title: '', desc: '', scheduledFor: '', startTime: '01:00', endTime: '03:00' })
    } catch (e) { console.error(e) }
    finally { setAdding(false) }
  }

  const selected = windows.find(w => w.id === showNotify)

  // Build flat notify list — each number = one row
  const notifyList = Object.entries(TEAM_ROLES).flatMap(([email, info]) =>
    (TEAM_PHONES[email] || [])
      .filter(e => isReal(e.phone))
      .map(e => ({ ...e, name: info.name, title: info.title }))
  )

  const pendingList = Object.entries(TEAM_ROLES).flatMap(([email, info]) =>
    (TEAM_PHONES[email] || [])
      .filter(e => !isReal(e.phone))
      .map(e => ({ ...e, name: info.name }))
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>Maintenance</h2>
          <p style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Schedule downtime windows and notify team instantly.</p>
        </div>
        <button onClick={() => setShowForm(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', borderRadius: 10, background: 'linear-gradient(135deg,#D4AF37,#C49A20)', border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={14} />New Window
        </button>
      </div>

      {/* Numbers missing warning */}
      {pendingList.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#fbbf24' }}>
          ⚠️ Phone numbers missing for: {pendingList.map(p => p.name.split(' ')[0]).join(', ')} — update TEAM_PHONES in maintenance-section.tsx
        </div>
      )}

      {/* Banner toggle */}
      <div style={{ background: bannerOn ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${bannerOn ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'all 0.25s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} style={{ color: bannerOn ? '#fbbf24' : '#555', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: bannerOn ? '#fbbf24' : '#f5f5f7' }}>Site-Wide Maintenance Banner</p>
            <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
              {bannerOn ? '⚠️ Banner is LIVE — visible to all visitors right now.' : 'Off — visitors see the site normally.'}
            </p>
          </div>
        </div>
        <button onClick={toggleBanner} disabled={bannerSaving} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: bannerOn ? '#fbbf24' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.25s', flexShrink: 0, opacity: bannerSaving ? 0.6 : 1 }}>
          <div style={{ position: 'absolute', top: 3, left: bannerOn ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Maintenance title *" style={inputStyle} />
              <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="What's changing? Brief description." rows={2} style={{ ...inputStyle, height: 'auto', padding: '8px 12px', resize: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <input type="date" value={form.scheduledFor} onChange={e => setForm(p => ({ ...p, scheduledFor: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
                <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
                <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAdd} disabled={adding || !form.title.trim() || !form.scheduledFor}
                  style={{ height: 36, padding: '0 18px', background: 'linear-gradient(135deg,#D4AF37,#C49A20)', border: 'none', color: '#000', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {adding ? <div style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><Check size={13} />Schedule</>}
                </button>
                <button onClick={() => setShowForm(false)} style={{ height: 36, padding: '0 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#555', borderRadius: 9, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Windows list */}
      {windows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#333' }}>
          <AlertTriangle size={28} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No maintenance windows yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {windows.map(w => {
            const s = STATUS_STYLE[w.status]
            return (
              <div key={w.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f7' }}>{w.title}</p>
                      <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 4, background: s.bg, color: s.color, fontWeight: 700, letterSpacing: '0.06em' }}>{w.status.toUpperCase()}</span>
                    </div>
                    {w.desc && <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 8 }}>{w.desc}</p>}
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#555', flexWrap: 'wrap' }}>
                      <span>📅 {new Date(w.scheduledFor + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>⏰ {w.startTime} – {w.endTime} IST</span>
                    </div>
                  </div>
                  {w.status === 'scheduled' && (
                    <button onClick={() => setShowNotify(w.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', borderRadius: 8, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      <MessageCircle size={12} />Notify Team
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Notify modal */}
      <AnimatePresence>
        {showNotify && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowNotify(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 24, maxWidth: 500, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7' }}>Notify Team</p>
                <button onClick={() => setShowNotify(null)} style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <p style={{ fontSize: 12, color: '#D4AF37', fontWeight: 600, marginBottom: 4 }}>{selected.title}</p>
              <p style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>Messages are pre-filled. Tap WhatsApp to send directly.</p>

              {/* Team WA rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {notifyList.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>No valid phone numbers set yet.</p>
                ) : notifyList.map((entry, i) => {
                  const waLink = `https://wa.me/${entry.phone}?text=${encodeURIComponent(buildTeamMsg(entry.name, selected.title, selected.scheduledFor, selected.startTime, selected.endTime))}`
                  const isCompany = entry.label === 'Company WA'
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: isCompany ? 'rgba(212,175,55,0.12)' : 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: isCompany ? '#D4AF37' : '#60a5fa', flexShrink: 0 }}>
                        {entry.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#f5f5f7' }}>{entry.name}</p>
                          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: isCompany ? 'rgba(212,175,55,0.12)' : 'rgba(96,165,250,0.1)', color: isCompany ? '#D4AF37' : '#60a5fa', fontWeight: 700 }}>
                            {entry.label}
                          </span>
                        </div>
                        <p style={{ fontSize: 10, color: '#555' }}>{entry.title}</p>
                      </div>
                      <a href={waLink} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 7, textDecoration: 'none', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <MessageCircle size={11} />WhatsApp
                      </a>
                    </div>
                  )
                })}
              </div>

              {/* Client broadcast */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#a1a1a6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Client Broadcast Message</p>
                  <button onClick={() => {
                    navigator.clipboard.writeText(buildClientMsg(selected.title, selected.scheduledFor, selected.startTime, selected.endTime)).catch(() => {})
                    setCopied(true); setTimeout(() => setCopied(false), 2000)
                  }} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', borderRadius: 7, background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#4ade80' : '#a1a1a6', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {copied ? <><Check size={11} />Copied!</> : <><Copy size={11} />Copy</>}
                  </button>
                </div>
                <pre style={{ fontFamily: 'inherit', fontSize: 11, color: '#666', background: 'rgba(255,255,255,0.02)', borderRadius: 9, padding: '12px 14px', whiteSpace: 'pre-wrap', lineHeight: 1.7, border: '1px solid rgba(255,255,255,0.06)', margin: 0 }}>
                  {buildClientMsg(selected.title, selected.scheduledFor, selected.startTime, selected.endTime)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}