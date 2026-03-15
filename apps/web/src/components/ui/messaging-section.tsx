'use client'
import { useState } from 'react'
import {
  Copy, Check, MessageCircle, Bell,
  Gift, Clock, AlertOctagon, Sparkles, Star, Wrench,
} from 'lucide-react'
import { TEAM_ROLES } from '@primekeys/shared'

// ─── Regional Festival Calendar ───────────────────────────────────────────────
export const FESTIVAL_CALENDAR: { name: string; regions: string[]; month: number; day: number; desc: string }[] = [
  { name: 'New Year',          regions: ['ALL'],             month: 1,  day: 1,  desc: 'Happy New Year {{name}}! Wishing you a prosperous year ahead.' },
  { name: 'Pongal',           regions: ['IN'],              month: 1,  day: 14, desc: 'Wishing you a joyful Pongal {{name}}!' },
  { name: 'Eid al-Fitr',      regions: ['AE','SA','QA','KW'], month: 3, day: 31, desc: 'Eid Mubarak {{name}}! May this Eid bring you joy and blessings.' },
  { name: 'Holi',             regions: ['IN'],              month: 3,  day: 14, desc: 'Happy Holi {{name}}! Colours of joy to you and your family!' },
  { name: 'Good Friday',      regions: ['GB','AU','CA'],    month: 4,  day: 18, desc: 'Wishing you a blessed Good Friday {{name}}.' },
  { name: 'Vishu',            regions: ['IN'],              month: 4,  day: 14, desc: 'Happy Vishu {{name}}! Wishing you a prosperous year ahead.' },
  { name: 'Eid al-Adha',      regions: ['AE','SA','QA','KW'], month: 6, day: 6,  desc: 'Eid al-Adha Mubarak {{name}}! May your sacrifices be rewarded.' },
  { name: 'Onam',             regions: ['IN'],              month: 9,  day: 5,  desc: 'Happy Onam {{name}}! May your harvest be plentiful.' },
  { name: 'Navratri',         regions: ['IN'],              month: 10, day: 2,  desc: 'Wishing you a spiritually fulfilling Navratri {{name}}!' },
  { name: 'Diwali',           regions: ['IN'],              month: 10, day: 20, desc: 'Happy Diwali {{name}}! May your life be filled with light and joy.' },
  { name: 'Christmas',        regions: ['ALL'],             month: 12, day: 25, desc: 'Merry Christmas {{name}}! Wishing you a season full of warmth.' },
  { name: 'UAE National Day', regions: ['AE'],              month: 12, day: 2,  desc: 'Happy UAE National Day {{name}}! We are proud to serve you.' },
]

// ─── Message Templates ────────────────────────────────────────────────────────
type Template = { id: string; trigger: string; color: string; body: string }

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'birthday',
    trigger: 'Birthday',
    color: '#f87171',
    body: `Hey {{name}}! The whole PRIMEKEYS team wishes you a very Happy Birthday! We hope your day is as amazing as you are. As a little gift from us, use code *{{ref_code}}* for 10% off your next renewal.\n\n— Team PRIMEKEYS`,
  },
  {
    id: 'renewal_7d',
    trigger: '7-Day Renewal Reminder',
    color: '#fbbf24',
    body: `Hi {{name}},\n\nYour *{{service}}* subscription is expiring in *7 days* ({{expiry_date}}).\n\nRenew now to keep enjoying uninterrupted access! Drop us a message here or visit primekeys.in\n\n— Team PRIMEKEYS`,
  },
  {
    id: 'renewal_1d',
    trigger: '1-Day Renewal Reminder',
    color: '#f87171',
    body: `Hi {{name}},\n\nLast reminder — your *{{service}}* subscription expires *tomorrow*.\n\nReply here or visit primekeys.in to renew instantly. Don't lose access!\n\n— Team PRIMEKEYS`,
  },
  {
    id: 'welcome',
    trigger: 'Welcome Message',
    color: '#4ade80',
    body: `Welcome to PRIMEKEYS {{name}}!\n\nYour *{{service}}* subscription is now active and ready to use.\n\nYour referral code is *{{ref_code}}* — share it with friends and get 10% off every renewal they make. No limits!\n\nNeed help? Just message us here anytime.\n\n— Team PRIMEKEYS`,
  },
  {
    id: 'festival',
    trigger: 'Festival Greeting',
    color: '#D4AF37',
    body: `{{festival_message}}\n\nFrom all of us at PRIMEKEYS — thank you for being part of our family {{name}}!\n\n— Team PRIMEKEYS`,
  },
  {
    id: 'maintenance',
    trigger: 'Maintenance Notice',
    color: '#60a5fa',
    body: `Hi {{name}},\n\nWe're scheduling a brief maintenance window on *{{maintenance_date}}* from *{{start_time}}* to *{{end_time}}*.\n\nDuring this time, some services may be briefly unavailable. We apologise for the inconvenience and will be back better than ever!\n\n— Team PRIMEKEYS`,
  },
]

// Lucide icon map — no emojis on the UI
const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  birthday:    Gift,
  renewal_7d:  Clock,
  renewal_1d:  AlertOctagon,
  welcome:     Sparkles,
  festival:    Star,
  maintenance: Wrench,
}

// ─── Quick WA Templates ───────────────────────────────────────────────────────
const QUICK_TEMPLATES = [
  { label: 'Credentials Delivered', body: `Hi! Your {{service}} credentials have been delivered to this chat. Enjoy! — PRIMEKEYS` },
  { label: 'Payment Received',      body: `Hi! We've received your payment for {{service}}. Your subscription is now active. — PRIMEKEYS` },
  { label: 'Custom Order Ready',    body: `Hi! Your custom order is ready. Please check your email or reply here for details. — PRIMEKEYS` },
  { label: 'Referral Credited',     body: `Hi! A referral discount has been applied to your account. Your next renewal gets 10% off! — PRIMEKEYS` },
]

export function MessagingSection() {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES)
  const [editId, setEditId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'automation' | 'quick' | 'log' | 'festivals'>('automation')

  const messageLogs = [
    { id: 'ml1', type: 'Birthday',       client: 'Riya Sharma',       sentAt: new Date(Date.now() - 86400000 * 2).toISOString(), preview: 'Hey Riya! The whole PRIMEKEYS team...' },
    { id: 'ml2', type: '7-Day Reminder', client: 'Karan Nair',        sentAt: new Date(Date.now() - 86400000 * 4).toISOString(), preview: 'Hi Karan, Your YouTube Premium...' },
    { id: 'ml3', type: 'Welcome',        client: 'Fatima Al-Hassan',  sentAt: new Date(Date.now() - 86400000 * 7).toISOString(), preview: 'Welcome to PRIMEKEYS Fatima...' },
  ]

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const saveEdit = () => {
    setTemplates(prev => prev.map((t: Template) => t.id === editId ? { ...t, body: editBody } : t))
    setEditId(null)
  }

  const TABS = [
    { key: 'automation' as const, label: 'Automation Templates' },
    { key: 'quick'      as const, label: 'Quick Copy' },
    { key: 'log'        as const, label: 'Message Log' },
    { key: 'festivals'  as const, label: 'Festival Calendar' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>Messaging & Automation</h2>
        <p style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Automated WhatsApp engine — all templates fire when the trigger condition is met.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ height: 30, padding: '0 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: activeTab === tab.key ? 'rgba(212,175,55,0.15)' : 'transparent', color: activeTab === tab.key ? '#D4AF37' : '#555', transition: 'all 0.15s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Automation Templates ─────────────────────────────────────────────── */}
      {activeTab === 'automation' && (
        <div>
          <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={14} style={{ color: '#60a5fa', flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#60a5fa', lineHeight: 1.6 }}>
              These templates fire automatically via a daily Firebase Cloud Function. Variables like{' '}
              <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0 4px', borderRadius: 3, fontSize: 11 }}>{'{{name}}'}</code>{' '}
              are replaced with real client data. Connect your WhatsApp API key in Settings to activate.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {templates.map(t => {
              const IconComp = TEMPLATE_ICONS[t.id] || Bell
              return (
                <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                  {/* Card header */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${t.color}18`, border: `1px solid ${t.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={13} style={{ color: t.color }} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f7' }}>{t.trigger}</p>
                      <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', fontWeight: 700 }}>ACTIVE</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => { if (editId === t.id) { setEditId(null) } else { setEditId(t.id); setEditBody(t.body) } }}
                        style={{ fontSize: 11, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {editId === t.id ? 'Cancel' : 'Edit'}
                      </button>
                      <button onClick={() => copy(t.body, t.id)}
                        style={{ fontSize: 11, color: copied === t.id ? '#4ade80' : '#555', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                        {copied === t.id ? <Check size={11} /> : <Copy size={11} />}
                        {copied === t.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '12px 16px' }}>
                    {editId === t.id ? (
                      <div>
                        <textarea
                          value={editBody}
                          onChange={e => setEditBody(e.target.value)}
                          rows={6}
                          style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 9, color: '#f5f5f7', fontSize: 12, lineHeight: 1.7, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button onClick={saveEdit}
                            style={{ height: 30, padding: '0 16px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            Save Template
                          </button>
                          <button onClick={() => setEditId(null)}
                            style={{ height: 30, padding: '0 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#555', borderRadius: 7, fontSize: 11, cursor: 'pointer' }}>
                            Discard
                          </button>
                        </div>
                      </div>
                    ) : (
                      <pre style={{ fontFamily: 'inherit', fontSize: 12, color: '#a1a1a6', whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0 }}>{t.body}</pre>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quick Copy ───────────────────────────────────────────────────────── */}
      {activeTab === 'quick' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {QUICK_TEMPLATES.map((t, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f7' }}>{t.label}</p>
                <button
                  onClick={() => copy(t.body, `q${i}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, height: 26, padding: '0 10px', borderRadius: 7, background: copied === `q${i}` ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied === `q${i}` ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`, color: copied === `q${i}` ? '#4ade80' : '#555', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  {copied === `q${i}` ? <Check size={11} /> : <Copy size={11} />}
                  {copied === `q${i}` ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{t.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Message Log ──────────────────────────────────────────────────────── */}
      {activeTab === 'log' && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f7' }}>Sent Messages</p>
          </div>
          {messageLogs.map((log, i) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < messageLogs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageCircle size={14} style={{ color: '#25D366' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7' }}>{log.client}</p>
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', color: '#60a5fa', fontWeight: 700 }}>{log.type.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: 11, color: '#555' }}>{log.preview}</p>
              </div>
              <p style={{ fontSize: 10, color: '#333' }}>{new Date(log.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Festival Calendar ─────────────────────────────────────────────────── */}
      {activeTab === 'festivals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {FESTIVAL_CALENDAR.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f7' }}>{f.name}</p>
                <span style={{ fontSize: 10, color: '#D4AF37', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 6 }}>
                  {new Date(2026, f.month - 1, f.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                {f.regions.map(r => (
                  <span key={r} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: r === 'ALL' ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.06)', color: r === 'ALL' ? '#D4AF37' : '#555', fontWeight: 700 }}>{r}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
