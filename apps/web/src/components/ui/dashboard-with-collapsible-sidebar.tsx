'use client'

import { CatalogueSection } from './catalogue-section'
import React, { useState, useEffect } from 'react'
import {
  Home, DollarSign, ShoppingCart, BarChart3, Users,
  ChevronsRight, TrendingUp, Activity, Package,
  Bell, Settings, Shield, ChevronDown, CalendarDays,
  ListChecks, MessageCircle, Wrench, CheckCircle2,
  Key, Send, Clock, AlertCircle, X, Eye, EyeOff,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getClients, activateOrder, getConfig, updateConfig } from '@/lib/api'
import { auth, db } from '@/lib/firebase'
import { getAuth } from 'firebase/auth'
import { TEAM_ROLES } from '@primekeys/shared'
import { collection, onSnapshot, query, orderBy, where, doc } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'

import { ClientManagementTable, MOCK_CLIENTS } from './client-management-table'
import { TaskSection } from './task-section'
import { CalendarSection } from './calendar-section'
import { ProfitSection } from './profit-section'
import { PerformanceSection } from './performance-section'
import { MessagingSection } from './messaging-section'
import { MaintenanceSection } from './maintenance-section'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

// ── Section types ────────────────────────────────────────
type Section = 'overview' | 'clients' | 'orders' | 'tasks' | 'calendar' | 'profit' | 'performance' | 'messaging' | 'maintenance' | 'settings' | 'catalogue'

// ── Role permissions ─────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, Section[]> = {
  'Founder & CEO':                    ['overview', 'clients', 'orders', 'tasks', 'calendar', 'profit', 'performance', 'messaging', 'maintenance', 'settings', 'catalogue'],
  'Co-Founder & Managing Director':   ['overview', 'clients', 'orders', 'tasks', 'calendar', 'performance', 'catalogue'],
  'Head Of Client Relations':         ['overview', 'clients', 'tasks', 'calendar'],
  'Head Of Social Media & Marketing': ['overview', 'tasks', 'calendar', 'messaging'],
  'Partner':                          ['overview', 'clients', 'tasks', 'calendar'],
}

function canAccess(role: string | null, section: Section): boolean {
  if (!role) return false
  return (ROLE_PERMISSIONS[role] || []).includes(section)
}

// ── Nav items ────────────────────────────────────────────
const NAV_ITEMS: { icon: React.ElementType; label: string; section: Section }[] = [
  { icon: Home,          label: 'Overview',     section: 'overview'     },
  { icon: Users,         label: 'Clients',      section: 'clients'      },
  { icon: ShoppingCart,  label: 'Orders',       section: 'orders'       },
  { icon: ListChecks,    label: 'Tasks',        section: 'tasks'        },
  { icon: CalendarDays,  label: 'Calendar',     section: 'calendar'     },
  { icon: DollarSign,    label: 'Profit',       section: 'profit'       },
  { icon: BarChart3,     label: 'Performance',  section: 'performance'  },
  { icon: MessageCircle, label: 'Messaging',    section: 'messaging'    },
  { icon: Wrench,        label: 'Maintenance',  section: 'maintenance'  },
  { icon: Package,       label: 'Catalogue',    section: 'catalogue'    },
  { icon: Settings,      label: 'Settings',     section: 'settings'     },
]

// ── Sidebar ──────────────────────────────────────────────
function Sidebar({ open, setOpen, active, setActive, role, taskBadge, orderBadge }: {
  open: boolean; setOpen: (v: boolean) => void
  active: Section; setActive: (s: Section) => void
  role: string | null; taskBadge: number; orderBadge: number
}) {
  return (
    <nav style={{
      position: 'sticky', top: 52, height: 'calc(100vh - 52px)',
      flexShrink: 0, display: 'flex', flexDirection: 'column',
      width: open ? 220 : 60, transition: 'width 0.3s ease',
      background: 'rgba(255,255,255,0.02)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: open ? '20px 16px 16px' : '20px 10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #D4AF37, #C49A20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#000' }}>PK</div>
        {open && (
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f7', whiteSpace: 'nowrap' }}>PRIMEKEYS</p>
            <p style={{ fontSize: 10, color: '#D4AF37', whiteSpace: 'nowrap', fontWeight: 600 }}>{role}</p>
          </div>
        )}
        {open && <ChevronDown size={14} style={{ color: '#555', marginLeft: 'auto', flexShrink: 0 }} />}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV_ITEMS.filter(item => canAccess(role, item.section)).map(item => {
          const isActive = active === item.section
          const badge = item.section === 'tasks' ? taskBadge : item.section === 'orders' ? orderBadge : 0
          return (
            <button key={item.section} onClick={() => setActive(item.section)} title={!open ? item.label : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: open ? '0 12px' : '0', justifyContent: open ? 'flex-start' : 'center', borderRadius: 10, border: 'none', cursor: 'pointer', background: isActive ? 'rgba(212,175,55,0.12)' : 'transparent', borderLeft: isActive ? '2px solid #D4AF37' : '2px solid transparent', color: isActive ? '#D4AF37' : '#6e6e73', fontWeight: isActive ? 600 : 400, fontSize: 13, transition: 'all 0.15s', width: '100%', whiteSpace: 'nowrap', position: 'relative' }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <item.icon size={16} />
                {badge > 0 && (
                  <span style={{ position: 'absolute', top: -5, right: -5, width: 14, height: 14, borderRadius: '50%', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>{badge}</span>
                )}
              </div>
              {open && item.label}
            </button>
          )
        })}
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setOpen(!open)} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '12px', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, justifyContent: open ? 'flex-start' : 'center', width: '100%' }}>
        <ChevronsRight size={16} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }} />
        {open && 'Collapse'}
      </button>
    </nav>
  )
}

// ── Stat card ────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub: string; icon: React.ElementType; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ padding: 8, borderRadius: 10, background: `${color}18` }}><Icon size={18} style={{ color }} /></div>
        <TrendingUp size={14} style={{ color: '#2dcc6e' }} />
      </div>
      <div>
        <p style={{ fontSize: 11, color: '#6e6e73', fontWeight: 500, marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.02em' }}>{value}</p>
        <p style={{ fontSize: 11, color: '#2dcc6e', marginTop: 2 }}>{sub}</p>
      </div>
    </div>
  )
}

// ── Overview ─────────────────────────────────────────────
function OverviewSection({ clients, setActive }: { clients: any[]; setActive: (s: Section) => void }) {
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [monthRevenue, setMonthRevenue] = useState(0)
  const [productCount, setProductCount] = useState(9)
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    // Live orders for activity feed + revenue
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setRecentOrders(allOrders.slice(0, 5))
      setOrderCount(allOrders.length)

      // Revenue from activated orders (INR)
      const now = new Date()
      const revenue = allOrders
        .filter((o: any) => o.status === 'activated' && o.currency === 'INR')
        .reduce((s: number, o: any) => s + (Number(o.total) || 0), 0)

      const thisMonthRevenue = allOrders
        .filter((o: any) => {
          if (o.status !== 'activated' || o.currency !== 'INR') return false
          const d = o.activatedAt?.seconds ? new Date(o.activatedAt.seconds * 1000) : new Date(o.activatedAt || 0)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((s: number, o: any) => s + (Number(o.total) || 0), 0)

      setMonthRevenue(thisMonthRevenue)
    })

    // Product count from catalogue
    const catUnsub = onSnapshot(doc(db, 'catalogue', 'config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const count = Object.keys(data || {}).filter(k => !k.startsWith('_')).length
        setProductCount(Math.max(count, 9))
      }
    })

    return () => { unsub(); catUnsub() }
  }, [])

  const active = clients.filter(c => c.status === 'active').length
  const expiringSoon = clients.filter(c => {
    const days = Math.ceil((new Date(c.expiryDate || c.expiry || '').getTime() - Date.now()) / 86400000)
    return days >= 0 && days <= 30 && c.status === 'active'
  }).sort((a, b) => new Date(a.expiryDate || a.expiry).getTime() - new Date(b.expiryDate || b.expiry).getTime())

  const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    pending:       { label: 'Order received',      color: '#fbbf24' },
    utr_submitted: { label: 'UTR submitted',        color: '#60a5fa' },
    activated:     { label: 'Credentials sent',    color: '#2dcc6e' },
    failed:        { label: 'Payment failed',       color: '#f87171' },
  }

  const revenueDisplay = monthRevenue > 0 ? `₹${monthRevenue.toLocaleString('en-IN')}` : '₹—'

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 24 }}>Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Clients"  value={String(clients.length)} sub={clients.length > 0 ? 'In Firestore' : 'No clients yet'} icon={Users}      color="#D4AF37" />
        <StatCard label="Active Subs"    value={String(active)}          sub={`${clients.length - active} inactive`}                  icon={Activity}   color="#2dcc6e" />
        <StatCard label="Month Revenue"  value={revenueDisplay}          sub="From activated orders (INR)"                             icon={DollarSign} color="#60a5fa" />
        <StatCard label="Products"       value={String(productCount)}  sub={`${orderCount} total orders`}                             icon={Package}    color="#a78bfa" />
      </div>

      {expiringSoon.length > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(251,191,36,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>Renewal Queue — Next 30 Days</h3>
            <button onClick={() => setActive('clients')} style={{ fontSize: 11, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
          </div>
          {expiringSoon.slice(0, 5).map((c, i) => {
            const days = Math.ceil((new Date(c.expiryDate || c.expiry).getTime() - Date.now()) / 86400000)
            return (
              <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', borderBottom: i < Math.min(expiringSoon.length, 5) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>{(c.name || '?').charAt(0)}</div>
                <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#f5f5f7' }}>{c.name}</p>
                <span style={{ fontSize: 11, color: days <= 7 ? '#f87171' : '#fbbf24', fontWeight: 700 }}>{days}d left</span>
                {c.whatsapp && (
                  <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#25D366', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MessageCircle size={11} />WA
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f7' }}>Recent Activity</h3>
          <button onClick={() => setActive('orders')} style={{ fontSize: 11, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding: '28px 24px', textAlign: 'center', color: '#333', fontSize: 13 }}>No orders yet — activity will appear here in real time.</div>
        ) : (
          recentOrders.map((o, i) => {
            const s = STATUS_LABEL[o.status] || STATUS_LABEL.pending
            const when = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null
            const timeAgo = when ? (() => {
              const diff = Date.now() - when.getTime()
              if (diff < 60000) return `${Math.round(diff/1000)}s ago`
              if (diff < 3600000) return `${Math.round(diff/60000)}m ago`
              if (diff < 86400000) return `${Math.round(diff/3600000)}h ago`
              return when.toLocaleDateString('en-IN', { day:'numeric', month:'short' })
            })() : ''
            return (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: i < recentOrders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7' }}>{s.label}</p>
                  <p style={{ fontSize: 11, color: '#6e6e73' }}>{o.name || 'Customer'} · {o.product} · <span style={{ color: '#D4AF37', fontWeight: 600 }}>{o.currency} {o.total}</span></p>
                </div>
                <span style={{ fontSize: 11, color: '#444' }}>{timeAgo}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Orders + Activate ────────────────────────────────────
function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [credentials, setCredentials] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const handleActivate = async () => {
    if (!credentials.trim()) { setError('Enter credentials first'); return }
    if (!adminSecret.trim()) { setError('Enter your admin secret'); return }
    setActivating(true)
    setError(null)
    try {
      await activateOrder({ orderId: selected.id, credentials }, adminSecret)
      setSuccess(`✓ Credentials sent to ${selected.email}`)
      setSelected(null)
      setCredentials('')
      setAdminSecret('')
    } catch (err: any) {
      setError(err.message || 'Activation failed')
    } finally {
      setActivating(false)
    }
  }

  const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
    pending:       { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
    utr_submitted: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
    activated:     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)'  },
    failed:        { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>Orders</h2>
          <p style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Live order queue — activate credentials instantly.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8 }}>
          <Clock size={12} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>
            {orders.filter(o => o.status === 'utr_submitted').length} awaiting activation
          </span>
        </div>
      </div>

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
          <span style={{ fontSize: 13, color: '#4ade80' }}>{success}</span>
          <button onClick={() => setSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#333' }}>
          <ShoppingCart size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map(order => {
            const s = STATUS_COLOR[order.status] || STATUS_COLOR.pending
            const isSelected = selected?.id === order.id
            return (
              <div key={order.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isSelected ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Package size={15} style={{ color: '#D4AF37' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f7' }}>{order.name}</p>
                      <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 4, background: s.bg, color: s.color, fontWeight: 700, letterSpacing: '0.06em', flexShrink: 0 }}>
                        {(order.status || 'pending').replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#555' }}>
                      {order.product} · {order.duration}mo · <span style={{ color: '#D4AF37', fontWeight: 600 }}>{order.currency} {order.total}</span>
                    </p>
                    <p style={{ fontSize: 10, color: '#444', marginTop: 2 }}>#{order.id.slice(-8).toUpperCase()} · {order.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {order.phone && (
                      <a href={`https://wa.me/${order.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 10px', borderRadius: 7, textDecoration: 'none', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366', fontSize: 11, fontWeight: 600 }}>
                        <MessageCircle size={11} />WA
                      </a>
                    )}
                    {order.status !== 'activated' ? (
                      <button onClick={() => { setSelected(isSelected ? null : order); setError(null) }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 7, background: isSelected ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        <Key size={11} />Activate
                      </button>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 7, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: 11, fontWeight: 600 }}>
                        <CheckCircle2 size={11} />Sent
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '16px 18px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {error && (
                          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertCircle size={13} />{error}
                          </div>
                        )}
                        <p style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>
                          Credentials will be emailed to <strong style={{ color: '#a1a1a6' }}>{order.email}</strong>
                        </p>
                        <textarea value={credentials} onChange={e => setCredentials(e.target.value)}
                          placeholder={'Email: example@gmail.com\nPassword: pass123\nPin: 1234'} rows={4}
                          style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f5f5f7', fontSize: 12, fontFamily: 'monospace', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                        />
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                          <input
                            type={showSecret ? 'text' : 'password'}
                            value={adminSecret}
                            onChange={e => setAdminSecret(e.target.value)}
                            placeholder="Admin secret key"
                            style={{ width: '100%', height: 36, padding: '0 36px 0 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret(s => !s)}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, display: 'flex', alignItems: 'center' }}
                            title={showSecret ? 'Hide secret' : 'Show secret'}
                          >
                            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={handleActivate} disabled={activating}
                            style={{ flex: 1, height: 38, background: activating ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg,#D4AF37,#C49A20)', color: '#000', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: activating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            {activating ? 'Sending...' : <><Send size={13} />Send Credentials</>}
                          </button>
                          <button onClick={() => { setSelected(null); setCredentials(''); setError(null) }}
                            style={{ height: 38, padding: '0 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#555', borderRadius: 9, fontSize: 12, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Settings ─────────────────────────────────────────────
interface ConfigState {
  upiId:          string
  whatsappNumber: string
  waApiKey:       string
  wiseLink:       string
}

function SettingsSection({ role }: { role: string | null }) {
  const { user } = useAuth()
  const [config, setConfig]           = useState<ConfigState>({
    upiId:          'paytm.slfsmng@pty',
    whatsappNumber: '+91 8111956481',
    waApiKey:       '',
    wiseLink:       'wise.com/pay/business/aaronjoythomas',
  })
  const [editing, setEditing]         = useState<string | null>(null)
  const [editValue, setEditValue]     = useState('')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)

  useEffect(() => {
    if (!user) return
    getAuth().currentUser?.getIdToken().then(token => {
      getConfig(token).then(data => {
        if (Object.keys(data).length > 0) {
          setConfig({
            upiId:          data.upiId          || 'paytm.slfsmng@pty',
            whatsappNumber: data.whatsappNumber  || '+91 8111956481',
            waApiKey:       data.waApiKey        || '',
            wiseLink:       data.wiseLink        || 'wise.com/pay/business/aaronjoythomas',
          })
        }
      }).catch(() => {})
    }).catch(() => {})
  }, [user])

  const startEdit = (key: keyof ConfigState) => {
    setEditing(key)
    setEditValue(config[key])
    setSaved(false)
  }

  const saveEdit = async () => {
    if (!editing || !user) return
    setSaving(true)
    try {
      const token = await getAuth().currentUser?.getIdToken()
      if (!token) return
      await updateConfig({ [editing]: editValue }, token)
      setConfig(prev => ({ ...prev, [editing]: editValue }))
      setEditing(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silent fail
    } finally {
      setSaving(false)
    }
  }

  const FIELDS: { label: string; key: keyof ConfigState; editable: boolean }[] = [
    { label: 'UPI ID',               key: 'upiId',          editable: true  },
    { label: 'WhatsApp Number',      key: 'whatsappNumber', editable: true  },
    { label: 'AiSensy / WA API Key', key: 'waApiKey',       editable: true  },
    { label: 'Wise Link',            key: 'wiseLink',       editable: true  },
    { label: 'Firebase Project',     key: 'upiId' as keyof ConfigState, editable: false },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 24 }}>Settings</h2>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 20px', background: 'rgba(212,175,55,0.05)', borderRadius: 12, border: '1px solid rgba(212,175,55,0.15)' }}>
          <Shield size={20} style={{ color: '#D4AF37' }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#D4AF37' }}>Founder Access Only</p>
            <p style={{ fontSize: 12, color: '#6e6e73' }}>System configuration requires Founder & CEO authentication.</p>
          </div>
        </div>
        {FIELDS.map(({ label, key, editable }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 13, color: '#a1a1a6' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {editing === key ? (
                <>
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null) }}
                    autoFocus
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: 7, color: '#f5f5f7', fontSize: 12,
                      fontFamily: 'monospace', padding: '4px 10px', outline: 'none', width: 200,
                    }}
                  />
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    style={{ height: 28, padding: '0 12px', borderRadius: 7, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 11, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving ? '…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    style={{ height: 28, padding: '0 10px', borderRadius: 7, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#555', fontSize: 11, cursor: 'pointer' }}>
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 13, color: editable ? '#f5f5f7' : '#444', fontFamily: 'monospace' }}>
                    {key === 'upiId' && label === 'Firebase Project' ? 'primekeys-ops (locked)' : config[key] || '(not set)'}
                  </span>
                  {editable && (
                    <button
                      onClick={() => startEdit(key)}
                      style={{ fontSize: 11, color: saved ? '#4ade80' : '#D4AF37', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {saved ? 'Saved ✓' : 'Edit'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main dashboard ───────────────────────────────────────
export default function AdminDashboard() {
  const { role, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [active, setActive] = useState<Section>('overview')
  const [clients, setClients] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [taskBadge, setTaskBadge] = useState(0)
  const [orderBadge, setOrderBadge] = useState(0)
  const [liveTaskStats, setLiveTaskStats] = useState<any[]>([])

  useEffect(() => {
    if (!canAccess(role, active)) {
      const allowed = NAV_ITEMS.find(n => canAccess(role, n.section))
      if (allowed) setActive(allowed.section)
    }
  }, [role, active])

  useEffect(() => {
    async function load() {
      if (DEV_BYPASS) { setClients(MOCK_CLIENTS); setLoadingClients(false); return }
      if (!auth.currentUser) { setLoadingClients(false); return }
      try {
        const token = await auth.currentUser.getIdToken()
        const res = await getClients(token)
        setClients(res.clients || [])
      } catch { setClients([]) }
      finally { setLoadingClients(false) }
    }
    if (canAccess(role, 'clients')) load()
    else setLoadingClients(false)
  }, [role])

  useEffect(() => {
    if (!user?.email || DEV_BYPASS) { setTaskBadge(DEV_BYPASS ? 1 : 0); return }
    const q = query(collection(db, 'tasks'),
      where('assignedTo', '==', user.email),
      where('status', 'in', ['pending', 'in-progress']))
    return onSnapshot(q, snap => setTaskBadge(snap.size))
  }, [user?.email])

  useEffect(() => {
    const q = query(collection(db, 'orders'), where('status', '==', 'utr_submitted'))
    return onSnapshot(q, snap => setOrderBadge(snap.size))
  }, [])

  // Wire real task stats per team member for PerformanceSection
  useEffect(() => {
    if (DEV_BYPASS) return
    const q = query(collection(db, 'tasks'))
    return onSnapshot(q, snap => {
      const statsMap: Record<string, any> = {}
      snap.docs.forEach(d => {
        const t = d.data() as any
        const email = t.assignedTo
        if (!email) return
        if (!statsMap[email]) statsMap[email] = { email, done: 0, inProgress: 0, pending: 0, blocked: 0, overdue: 0 }
        if (t.status === 'done') statsMap[email].done++
        else if (t.status === 'in-progress') statsMap[email].inProgress++
        else if (t.status === 'blocked') statsMap[email].blocked++
        else statsMap[email].pending++
        if (t.dueDate && new Date(t.dueDate).getTime() < Date.now() && t.status !== 'done') statsMap[email].overdue++
      })
      setLiveTaskStats(Object.values(statsMap))
    })
  }, [])



  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 52px)', background: '#080808' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} active={active} setActive={setActive} role={role} taskBadge={taskBadge} orderBadge={orderBadge} />

      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 11, color: '#D4AF37', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{role}</p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.03em' }}>Team Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ position: 'relative', padding: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', color: '#a1a1a6' }}>
              <Bell size={16} />
              {taskBadge > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, background: '#f87171', borderRadius: '50%' }} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 980 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#D4AF37' }}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: '#D4AF37', fontWeight: 600 }}>{user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </div>

        {active === 'overview'    && <OverviewSection clients={clients} setActive={setActive} />}
        {active === 'clients'     && <ClientManagementTable clients={clients} loading={loadingClients} />}
        {active === 'orders'      && <OrdersSection />}
        {active === 'tasks'       && <TaskSection currentEmail={user?.email || ''} currentRole={role} />}
        {active === 'calendar'    && <CalendarSection currentEmail={user?.email || ''} />}
        {active === 'profit'      && <ProfitSection />}
        {active === 'performance' && <PerformanceSection taskStats={liveTaskStats} />}
        {active === 'messaging'   && <MessagingSection />}
        {active === 'maintenance' && <MaintenanceSection />}
        {active === 'catalogue'   && <CatalogueSection />}
        {active === 'settings'    && <SettingsSection role={role} />}
      </main>
    </div>
  )
}