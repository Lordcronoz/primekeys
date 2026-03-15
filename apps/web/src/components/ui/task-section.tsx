'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Clock, AlertTriangle, ChevronDown } from 'lucide-react'
import { db } from '@/lib/firebase'
import {
  collection, addDoc, updateDoc, doc, onSnapshot,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { TEAM_ROLES } from '@primekeys/shared'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  desc: string
  assignedTo: string   // email
  assignedBy: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  createdAt: number
  updatedAt: number
}

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Post March promo reel', desc: 'Create and schedule the Instagram reel for the March discount.', assignedTo: 'shayanika7@gmail.com', assignedBy: 'aaronjthomas.cj@gmail.com', priority: 'high', status: 'in-progress', dueDate: '2026-03-16', createdAt: Date.now() - 86400000, updatedAt: Date.now() - 3600000 },
  { id: 't2', title: 'Follow up with 3 expiring clients', desc: 'Call / WhatsApp clients whose subscriptions expire this week.', assignedTo: 'devikaprasannan089@gmail.com', assignedBy: 'aaronjthomas.cj@gmail.com', priority: 'urgent', status: 'pending', dueDate: '2026-03-14', createdAt: Date.now() - 7200000, updatedAt: Date.now() - 7200000 },
  { id: 't3', title: 'Q1 revenue report', desc: 'Compile Jan-Mar revenue from payment logs and share with Nicholson.', assignedTo: 'aaronjthomas.cj@gmail.com', assignedBy: 'aaronjthomas.cj@gmail.com', priority: 'medium', status: 'pending', dueDate: '2026-03-31', createdAt: Date.now() - 172800000, updatedAt: Date.now() - 172800000 },
  { id: 't4', title: 'Q4 partnership review', desc: 'Review all partnership agreements from Q4 and flag renewals.', assignedTo: 'nicholsonvargheese81939@gmail.com', assignedBy: 'aaronjthomas.cj@gmail.com', priority: 'low', status: 'done', dueDate: '2026-03-10', createdAt: Date.now() - 604800000, updatedAt: Date.now() - 86400000 },
]

const PRIORITY_META: Record<TaskPriority, { color: string; label: string }> = {
  low:    { color: '#4ade80', label: 'Low'    },
  medium: { color: '#60a5fa', label: 'Medium' },
  high:   { color: '#fbbf24', label: 'High'   },
  urgent: { color: '#f87171', label: 'Urgent' },
}

const STATUS_COLS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'pending',    label: 'Pending',     color: '#555'    },
  { key: 'in-progress',label: 'In Progress', color: '#60a5fa' },
  { key: 'done',       label: 'Done',        color: '#4ade80' },
  { key: 'blocked',    label: 'Blocked',     color: '#f87171' },
]

function TaskCard({ task, currentEmail, onStatusChange }: { task: Task; currentEmail: string; onStatusChange: (id: string, s: TaskStatus) => void }) {
  const [open, setOpen] = useState(false)
  const pm = PRIORITY_META[task.priority]
  const isOwn = task.assignedTo === currentEmail
  const teamMember = TEAM_ROLES[task.assignedTo as keyof typeof TEAM_ROLES]
  const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
  const overdue = daysLeft < 0 && task.status !== 'done'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${overdue ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ width: 3, height: 38, borderRadius: 2, background: pm.color, flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f7', marginBottom: 3 }}>{task.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: pm.color, background: `${pm.color}18`, padding: '1px 6px', borderRadius: 4, letterSpacing: '0.06em' }}>{pm.label.toUpperCase()}</span>
            <span style={{ fontSize: 10, color: overdue ? '#f87171' : '#444' }}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d`}
            </span>
            <span style={{ fontSize: 10, color: '#444' }}>{teamMember?.name || task.assignedTo.split('@')[0]}</span>
          </div>
        </div>
        <ChevronDown size={14} style={{ color: '#444', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 10 }}>
              {task.desc && <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 10 }}>{task.desc}</p>}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUS_COLS.map(s => (
                  <button key={s.key} onClick={e => { e.stopPropagation(); onStatusChange(task.id, s.key) }}
                    style={{ height: 26, padding: '0 10px', borderRadius: 6, border: `1px solid ${task.status === s.key ? s.color : 'rgba(255,255,255,0.1)'}`, background: task.status === s.key ? `${s.color}18` : 'transparent', color: task.status === s.key ? s.color : '#555', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function TaskSection({ currentEmail, currentRole }: { currentEmail: string; currentRole: string | null }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', desc: '', assignedTo: Object.keys(TEAM_ROLES)[0], priority: 'medium' as TaskPriority, dueDate: '' })
  const isFounder = currentRole === 'Founder & CEO' || currentRole === 'Co-Founder & Managing Director'

  useEffect(() => {
    if (DEV_BYPASS) return
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))))
  }, [])

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: Date.now() } : t))
    if (!DEV_BYPASS) await updateDoc(doc(db, 'tasks', id), { status, updatedAt: serverTimestamp() })
  }

  const handleAdd = async () => {
    if (!form.title || !form.dueDate) return
    const newTask: Omit<Task, 'id'> = { ...form, assignedBy: currentEmail, status: 'pending', createdAt: Date.now(), updatedAt: Date.now() }
    if (DEV_BYPASS) {
      setTasks(prev => [{ id: `t${Date.now()}`, ...newTask }, ...prev])
    } else {
      await addDoc(collection(db, 'tasks'), { ...newTask, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    }
    setShowForm(false)
    setForm({ title: '', desc: '', assignedTo: Object.keys(TEAM_ROLES)[0], priority: 'medium', dueDate: '' })
  }

  const myTasks = tasks.filter(t => t.assignedTo === currentEmail)
  const allTasks = tasks

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>Task Tracker</h2>
          <p style={{ fontSize: 12, color: '#555', marginTop: 3 }}>{tasks.filter(t => t.status !== 'done').length} active · {tasks.filter(t => t.status === 'done').length} completed</p>
        </div>
        {isFounder && (
          <button onClick={() => setShowForm(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 9, background: showForm ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Assign Task
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title *" style={{ height: 36, padding: '0 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
              <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="Description (optional)" rows={2} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit', resize: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} style={{ height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}>
                  {Object.entries(TEAM_ROLES).map(([email, info]) => <option key={email} value={email} style={{ background: '#111' }}>{info.name}</option>)}
                </select>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))} style={{ height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}>
                  {(['low','medium','high','urgent'] as const).map(p => <option key={p} value={p} style={{ background: '#111' }}>{PRIORITY_META[p].label}</option>)}
                </select>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} style={{ height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 12, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAdd} style={{ height: 34, padding: '0 18px', borderRadius: 8, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Assign</button>
                <button onClick={() => setShowForm(false)} style={{ height: 34, padding: '0 14px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#555', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {STATUS_COLS.map(col => {
          const colTasks = (isFounder ? allTasks : myTasks).filter(t => t.status === col.key)
          return (
            <div key={col.key} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: col.color, letterSpacing: '0.08em' }}>{col.label.toUpperCase()}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#444', fontWeight: 600 }}>{colTasks.length}</span>
              </div>
              <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
                {colTasks.map(t => <TaskCard key={t.id} task={t} currentEmail={currentEmail} onStatusChange={handleStatusChange} />)}
                {colTasks.length === 0 && <p style={{ fontSize: 11, color: '#333', textAlign: 'center', paddingTop: 16 }}>Empty</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
