'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, DollarSign, Calendar, Package } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { PRODUCTS } from '@primekeys/shared'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

export interface Payment {
  id: string
  clientName: string
  amount: number
  utr: string
  service: string
  date: string
  notes?: string
  createdAt: number
}

const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', clientName: 'Riya Sharma',       amount: 399,  utr: 'UPI2026031300001', service: 'netflix',  date: '2026-03-13', notes: '', createdAt: Date.now() - 86400000 },
  { id: 'p2', clientName: 'Fatima Al-Hassan',  amount: 1299, utr: 'WISE20260311XYZ',  service: 'chatgpt', date: '2026-03-11', notes: 'Paid via Wise', createdAt: Date.now() - 259200000 },
  { id: 'p3', clientName: 'Aditya Menon',      amount: 249,  utr: 'UPI2026030800045', service: 'spotify', date: '2026-03-08', notes: '', createdAt: Date.now() - 432000000 },
  { id: 'p4', clientName: 'Karan Nair',        amount: 149,  utr: 'UPI2026030200033', service: 'youtube', date: '2026-03-02', notes: '', createdAt: Date.now() - 950400000 },
  { id: 'p5', clientName: 'Sarah Mitchell',    amount: 899,  utr: 'WISE20260228ABC',  service: 'canva',   date: '2026-02-28', notes: 'USD payment converted', createdAt: Date.now() - 1296000000 },
  { id: 'p6', clientName: 'Arjun Pillai',      amount: 399,  utr: 'UPI2026022500088', service: 'netflix', date: '2026-02-25', notes: '', createdAt: Date.now() - 1555200000 },
]

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function ProfitSection() {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', amount: '', utr: '', service: 'netflix', date: new Date().toISOString().split('T')[0], notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (DEV_BYPASS) return
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment))))
  }, [])

  const now = new Date()
  const thisMonth = payments.filter(p => { const d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
  const thisWeek  = payments.filter(p => (Date.now() - new Date(p.date).getTime()) < 7 * 86400000)
  const today     = payments.filter(p => { const d = new Date(p.date); return d.toDateString() === now.toDateString() })
  const total     = payments.reduce((s, p) => s + p.amount, 0)
  const monthTotal = thisMonth.reduce((s, p) => s + p.amount, 0)

  // Bar chart: last 6 months
  const months6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const monthPayments = payments.filter(p => { const pd = new Date(p.date); return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear() })
    return { label: MONTHS_SHORT[d.getMonth()], total: monthPayments.reduce((s, p) => s + p.amount, 0) }
  })
  const maxBar = Math.max(...months6.map(m => m.total), 1)

  const handleAdd = async () => {
    if (!form.clientName || !form.amount || !form.utr) return
    setSaving(true)
    const newP: Omit<Payment, 'id'> = { ...form, amount: parseFloat(form.amount), createdAt: Date.now() }
    if (DEV_BYPASS) setPayments(prev => [{ id: `p${Date.now()}`, ...newP }, ...prev])
    else await addDoc(collection(db, 'payments'), { ...newP, createdAt: serverTimestamp() })
    setShowForm(false)
    setForm({ clientName: '', amount: '', utr: '', service: 'netflix', date: new Date().toISOString().split('T')[0], notes: '' })
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>Profit Tracker</h2>
          <p style={{ fontSize: 12, color: '#D4AF37', opacity: 0.7, marginTop: 2 }}>◈ Founder access only</p>
        </div>
        <button onClick={() => setShowForm(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 9, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} />Log Payment
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: "Today",      value: `₹${today.reduce((s,p) => s + p.amount, 0).toLocaleString('en-IN')}`,    icon: Calendar,    color: '#60a5fa' },
          { label: "This Week",  value: `₹${thisWeek.reduce((s,p) => s + p.amount, 0).toLocaleString('en-IN')}`,  icon: TrendingUp,  color: '#4ade80' },
          { label: "This Month", value: `₹${monthTotal.toLocaleString('en-IN')}`,                                   icon: DollarSign,  color: '#D4AF37' },
          { label: "All Time",   value: `₹${total.toLocaleString('en-IN')}`,                                        icon: Package,     color: '#a78bfa' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: '0.08em' }}>{label.toUpperCase()}</span>
              <div style={{ padding: 6, borderRadius: 8, background: `${color}18` }}><Icon size={14} style={{ color }} /></div>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#f5f5f7', letterSpacing: '-0.02em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick log form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 14, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <input value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} placeholder="Client name *" style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
            <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Amount ₹ *" type="number" style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
            <input value={form.utr} onChange={e => setForm(p => ({ ...p, utr: e.target.value }))} placeholder="UTR / Ref *" style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
            <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}>
              {PRODUCTS.map(pr => <option key={pr.id} value={pr.id} style={{ background: '#111' }}>{pr.name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAdd} disabled={saving} style={{ flex: 1, height: 34, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{saving ? '…' : 'Log'}</button>
              <button onClick={() => setShowForm(false)} style={{ height: 34, padding: '0 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#555', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Revenue bars */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f7', marginBottom: 16 }}>Monthly Revenue</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
          {months6.map((m, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 9, color: '#555' }}>₹{(m.total / 1000).toFixed(1)}k</span>
              <div style={{ width: '100%', height: `${Math.max(4, (m.total / maxBar) * 70)}px`, background: i === 5 ? '#D4AF37' : 'rgba(212,175,55,0.25)', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease' }} />
              <span style={{ fontSize: 9, color: '#555' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment log */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f7' }}>All Payments</span>
          <span style={{ fontSize: 12, color: '#555' }}>{payments.length} records</span>
        </div>
        {payments.map((p, i) => {
          const prod = PRODUCTS.find(pr => pr.id === p.service)
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < payments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${prod?.color || '#333'}22`, border: `1px solid ${prod?.color || '#333'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: prod?.color || '#555', flexShrink: 0 }}>
                {prod?.name.charAt(0) || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7' }}>{p.clientName}</p>
                <p style={{ fontSize: 10, color: '#555', fontFamily: 'monospace' }}>{p.utr}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#D4AF37' }}>₹{p.amount.toLocaleString('en-IN')}</p>
                <p style={{ fontSize: 10, color: '#444' }}>{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
