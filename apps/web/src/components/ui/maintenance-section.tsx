'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Mail, AlertTriangle, Plus, X, Shield } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc, setDoc } from 'firebase/firestore'
import { TEAM_ROLES, WA_NUMBER } from '@primekeys/shared'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

export interface MaintenanceWindow {
  id: string
  title: string
  desc: string
  scheduledFor: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  notifiedAt?: string
  createdAt: number
}

const MOCK_MAINTENANCE: MaintenanceWindow[] = [
  { id: 'm1', title: 'Backend v2 Deploy', desc: 'Deploy new authenticated API endpoints. Admin dashboard full rebuild.', scheduledFor: '2026-03-18', startTime: '02:00', endTime: '04:00', status: 'scheduled', createdAt: Date.now() - 86400000 },
  { id: 'm2', title: 'Database migration v1→v2', desc: 'Migrating client records to the new Firestore schema.', scheduledFor: '2026-02-20', startTime: '01:00', endTime: '03:00', status: 'completed', notifiedAt: '2026-02-19T18:00:00', createdAt: Date.now() - 2592000000 },
]

// Pre-built WhatsApp team message templates
function buildTeamWALink(name: string, phone: string, title: string, date: string, start: string, end: string) {
  const msg = `Hey ${name}! 👋\n\nPlanned Maintenance Notice from PRIMEKEYS:\n\n*${title}*\n📅 Date: ${date}\n⏰ Time: ${start} – ${end} IST\n\nPlease be aware during this window. Thanks! — Aaron`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

function buildClientBroadcastMsg(title: string, date: string, start: string, end: string) {
  return `Hi! 👋\n\nWe're scheduling a brief maintenance window:\n\n*${title}*\n📅 ${date} · ⏰ ${start} – ${end} IST\n\nSome services may be briefly unavailable during this time. We apologise for any inconvenience and will be back soon!\n\nThank you for your patience! 🙏\n— Team PRIMEKEYS`
}

const STATUS_STYLE: Record<MaintenanceWindow['status'], { color: string; bg: string }> = {
  scheduled:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  active:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  completed:  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)'  },
  cancelled:  { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

export function MaintenanceSection() {
  const [windows, setWindows] = useState<MaintenanceWindow[]>(MOCK_MAINTENANCE)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', desc: '', scheduledFor: '', startTime: '01:00', endTime: '03:00' })
  const [bannerOn, setBannerOn] = useState(false)
  const [showNotify, setShowNotify] = useState<string | null>(null)

  useEffect(() => {
    if (DEV_BYPASS) return
    const q = query(collection(db, 'maintenance'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setWindows(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceWindow))))
  }, [])

  const handleAdd = async () => {
    if (!form.title || !form.scheduledFor) return
    const newW: Omit<MaintenanceWindow, 'id'> = { ...form, status: 'scheduled', createdAt: Date.now() }
    if (DEV_BYPASS) setWindows(prev => [{ id: `m${Date.now()}`, ...newW }, ...prev])
    else await addDoc(collection(db, 'maintenance'), { ...newW, createdAt: serverTimestamp() })
    setShowForm(false)
    setForm({ title: '', desc: '', scheduledFor: '', startTime: '01:00', endTime: '03:00' })
  }

  const teamEmails = Object.entries(TEAM_ROLES).filter(([, r]) => r.role !== 'Founder & CEO')
  const selected = windows.find(w => w.id === showNotify)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>Maintenance Mode</h2>
          <p style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Schedule downtime and notify team & clients instantly.</p>
        </div>
        <button onClick={() => setShowForm(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 9, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} />New Window
        </button>
      </div>

      {/* Site-wide banner toggle */}
      <div style={{ background: bannerOn ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${bannerOn ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} style={{ color: bannerOn ? '#fbbf24' : '#555', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: bannerOn ? '#fbbf24' : '#f5f5f7' }}>Site-Wide Maintenance Banner</p>
            <p style={{ fontSize: 11, color: '#555' }}>{bannerOn ? 'Banner is visible to all visitors on the site.' : 'Off — visitors see the site normally.'}</p>
          </div>
        </div>
        <button onClick={() => setBannerOn(o => !o)} style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: bannerOn ? '#fbbf24' : 'rgba(255,255,255,0.1)',
          position: 'relative', transition: 'background 0.25s',
        }}>
          <div style={{ position: 'absolute', top: 2, left: bannerOn ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Maintenance title *" style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
              <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="What's changing? (describe the maintenance)" rows={2} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit', resize: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <input type="date" value={form.scheduledFor} onChange={e => setForm(p => ({ ...p, scheduledFor: e.target.value }))} style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }} />
                <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }} />
                <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAdd} style={{ height: 34, padding: '0 18px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Schedule</button>
                <button onClick={() => setShowForm(false)} style={{ height: 34, padding: '0 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#555', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Windows list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {windows.map(w => {
          const s = STATUS_STYLE[w.status]
          return (
            <div key={w.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f7' }}>{w.title}</p>
                    <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 4, background: s.bg, color: s.color, fontWeight: 700, letterSpacing: '0.06em' }}>{w.status.toUpperCase()}</span>
                  </div>
                  {w.desc && <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 8 }}>{w.desc}</p>}
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#555' }}>
                    <span>📅 {new Date(w.scheduledFor).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>⏰ {w.startTime} – {w.endTime} IST</span>
                  </div>
                </div>
                {w.status === 'scheduled' && (
                  <button onClick={() => setShowNotify(w.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', borderRadius: 8, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <MessageCircle size={12} />Notify Team
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Notify modal */}
      <AnimatePresence>
        {showNotify && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowNotify(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: 24, maxWidth: 480, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f7' }}>Notify Team: {selected.title}</p>
                <button onClick={() => setShowNotify(null)} style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>

              <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>Click each person's WhatsApp button — the message is pre-filled and ready to send.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {teamEmails.map(([email, info]) => (
                  <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#a1a1a6' }}>{info.name.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#f5f5f7' }}>{info.name}</p>
                      <p style={{ fontSize: 10, color: '#555' }}>{info.title}</p>
                    </div>
                    <a
                      href={buildTeamWALink(info.name, '91' + Math.random().toString().slice(2, 12), selected.title, selected.scheduledFor, selected.startTime, selected.endTime)}
                      target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 12px', borderRadius: 7, textDecoration: 'none', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366', fontSize: 11, fontWeight: 600 }}>
                      <MessageCircle size={11} />WA
                    </a>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 10 }}>Client broadcast template (copy & paste to WhatsApp broadcast list):</p>
                <pre style={{ fontFamily: 'inherit', fontSize: 11, color: '#666', background: 'rgba(255,255,255,0.03)', borderRadius: 9, padding: '10px 12px', whiteSpace: 'pre-wrap', lineHeight: 1.65, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {buildClientBroadcastMsg(selected.title, selected.scheduledFor, selected.startTime, selected.endTime)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
