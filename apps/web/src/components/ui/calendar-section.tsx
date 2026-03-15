'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { TEAM_ROLES } from '@primekeys/shared'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

export interface CalendarEvent {
  id: string
  title: string
  type: 'meeting' | 'review' | 'maintenance' | 'personal'
  date: string   // YYYY-MM-DD
  time?: string
  desc?: string
  createdBy: string
  createdAt: number
}

const EVENT_COLORS: Record<CalendarEvent['type'], { bg: string; border: string; text: string; label: string }> = {
  meeting:     { bg: 'rgba(96,165,250,0.18)',  border: '#60a5fa', text: '#60a5fa', label: 'Meeting'     },
  review:      { bg: 'rgba(167,139,250,0.18)', border: '#a78bfa', text: '#a78bfa', label: 'Review'      },
  maintenance: { bg: 'rgba(251,191,36,0.18)',  border: '#fbbf24', text: '#fbbf24', label: 'Maintenance' },
  personal:    { bg: 'rgba(74,222,128,0.18)',  border: '#4ade80', text: '#4ade80', label: 'Personal'    },
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Q1 Review Call', type: 'review', date: '2026-03-15', time: '10:00', desc: 'All hands review of Q1 performance.', createdBy: 'aaronjthomas.cj@gmail.com', createdAt: Date.now() },
  { id: 'e2', title: 'Backend Deploy', type: 'maintenance', date: '2026-03-18', time: '02:00', desc: 'Scheduled downtime for backend v2 deployment.', createdBy: 'aaronjthomas.cj@gmail.com', createdAt: Date.now() },
  { id: 'e3', title: 'Campaign Planning', type: 'meeting', date: '2026-03-20', time: '14:00', desc: 'Plan the April social media campaign.', createdBy: 'shayanika7@gmail.com', createdAt: Date.now() },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function isSameDay(a: string, b: Date) {
  const d = new Date(a)
  return d.getFullYear() === b.getFullYear() && d.getMonth() === b.getMonth() && d.getDate() === b.getDate()
}

export function CalendarSection({ currentEmail }: { currentEmail: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'meeting' as CalendarEvent['type'], time: '', desc: '' })

  useEffect(() => {
    if (DEV_BYPASS) return
    const q = query(collection(db, 'calendar_events'), orderBy('date'))
    return onSnapshot(q, snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent))))
  }, [])

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const startDow = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const cells = Array.from({ length: Math.ceil((startDow + daysInMonth) / 7) * 7 }, (_, i) => {
    const dayNum = i - startDow + 1
    return dayNum >= 1 && dayNum <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), dayNum) : null
  })

  const dayEvents = (d: Date) => events.filter(e => isSameDay(e.date, d))
  const selectedEvents = selectedDate ? dayEvents(selectedDate) : []
  const today = new Date()

  const handleAdd = async () => {
    if (!form.title || !selectedDate) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    const newEvent: Omit<CalendarEvent, 'id'> = { ...form, date: dateStr, createdBy: currentEmail, createdAt: Date.now() }
    if (DEV_BYPASS) {
      setEvents(prev => [...prev, { id: `e${Date.now()}`, ...newEvent }])
    } else {
      await addDoc(collection(db, 'calendar_events'), { ...newEvent, createdAt: serverTimestamp() })
    }
    setShowForm(false)
    setForm({ title: '', type: 'meeting', time: '', desc: '' })
  }

  const handleDelete = async (id: string, createdBy: string) => {
    if (createdBy !== currentEmail && currentEmail !== 'aaronjthomas.cj@gmail.com') return
    setEvents(prev => prev.filter(e => e.id !== id))
    if (!DEV_BYPASS) await deleteDoc(doc(db, 'calendar_events', id))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>Shared Calendar</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Object.entries(EVENT_COLORS).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.border }} />
              <span style={{ fontSize: 10, color: '#555' }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Calendar grid */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Nav */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1a6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f7' }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
            <button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1a6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={14} /></button>
          </div>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {DAYS.map(d => <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '0.08em' }}>{d}</div>)}
          </div>
          {/* Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((date, i) => {
              if (!date) return <div key={i} style={{ minHeight: 68, borderRight: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }} />
              const evs = dayEvents(date)
              const isToday = isSameDay(date.toISOString().split('T')[0], today)
              const isSelected = selectedDate && isSameDay(date.toISOString().split('T')[0], selectedDate)
              return (
                <div key={i} onClick={() => setSelectedDate(date)}
                  style={{ minHeight: 68, padding: 6, borderRight: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', background: isSelected ? 'rgba(212,175,55,0.07)' : 'transparent', transition: 'background 0.15s', position: 'relative' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: isToday ? '#D4AF37' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 400, color: isToday ? '#000' : date.getMonth() === month.getMonth() ? '#a1a1a6' : '#333' }}>{date.getDate()}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {evs.slice(0, 2).map(e => (
                      <div key={e.id} style={{ height: 4, borderRadius: 2, background: EVENT_COLORS[e.type].border, opacity: 0.85 }} />
                    ))}
                    {evs.length > 2 && <span style={{ fontSize: 8, color: '#555' }}>+{evs.length - 2}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar: selected day */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7' }}>
                {selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : 'Select a day'}
              </p>
              {selectedDate && (
                <button onClick={() => setShowForm(o => !o)} style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={13} /></button>
              )}
            </div>

            <AnimatePresence>
              {showForm && selectedDate && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 12, background: 'rgba(212,175,55,0.04)', borderRadius: 10, border: '1px solid rgba(212,175,55,0.15)' }}>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Event title *" style={{ height: 32, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                      <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))} style={{ height: 32, padding: '0 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}>
                        {Object.entries(EVENT_COLORS).map(([k, v]) => <option key={k} value={k} style={{ background: '#111' }}>{v.label}</option>)}
                      </select>
                      <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} style={{ height: 32, padding: '0 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }} />
                    </div>
                    <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="Notes (optional)" rows={2} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#f5f5f7', fontSize: 11, outline: 'none', fontFamily: 'inherit', resize: 'none' }} />
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={handleAdd} style={{ flex: 1, height: 30, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Add</button>
                      <button onClick={() => setShowForm(false)} style={{ height: 30, padding: '0 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#555', borderRadius: 7, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedDate && selectedEvents.length === 0 && !showForm && (
              <p style={{ fontSize: 12, color: '#333', textAlign: 'center', padding: '12px 0' }}>No events · click + to add</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEvents.map(e => {
                const meta = EVENT_COLORS[e.type]
                const creator = TEAM_ROLES[e.createdBy as keyof typeof TEAM_ROLES]
                const canDelete = e.createdBy === currentEmail || currentEmail === 'aaronjthomas.cj@gmail.com'
                return (
                  <div key={e.id} style={{ padding: '10px 12px', borderRadius: 10, background: meta.bg, border: `1px solid ${meta.border}33`, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7', marginBottom: 3 }}>{e.title}</p>
                        <div style={{ display: 'flex', gap: 6, fontSize: 10, color: '#555' }}>
                          <span style={{ color: meta.text, fontWeight: 600 }}>{meta.label}</span>
                          {e.time && <span>· {e.time}</span>}
                        </div>
                        {e.desc && <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{e.desc}</p>}
                        <p style={{ fontSize: 9, color: '#333', marginTop: 4 }}>by {creator?.name || e.createdBy.split('@')[0]}</p>
                      </div>
                      {canDelete && <button onClick={() => handleDelete(e.id, e.createdBy)} style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={10} /></button>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming events */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f5f5f7', marginBottom: 12 }}>Upcoming (7 days)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events
                .filter(e => { const d = new Date(e.date); const n = new Date(); return d >= n && (d.getTime() - n.getTime()) <= 7 * 86400000 })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 28, borderRadius: 2, background: EVENT_COLORS[e.type].border, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#f5f5f7' }}>{e.title}</p>
                      <p style={{ fontSize: 10, color: '#444' }}>{new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}{e.time ? ` · ${e.time}` : ''}</p>
                    </div>
                  </div>
                ))}
              {events.filter(e => { const d = new Date(e.date); const n = new Date(); return d >= n && (d.getTime() - n.getTime()) <= 7 * 86400000 }).length === 0 && (
                <p style={{ fontSize: 12, color: '#333' }}>Nothing in the next 7 days</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
