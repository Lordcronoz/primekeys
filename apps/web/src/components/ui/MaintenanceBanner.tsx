'use client'

import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AlertTriangle, X } from 'lucide-react'

export function MaintenanceBanner() {
  const [active, setActive] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Listen to banner state in real-time
    return onSnapshot(doc(db, 'maintenance', '_banner'), snap => {
      if (snap.exists()) setActive(snap.data().active ?? false)
    }, () => {})
  }, [])

  if (!active || dismissed) return null

  return (
    <div style={{
      position: 'fixed', top: 52, left: 0, right: 0, zIndex: 999,
      background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.1))',
      borderBottom: '1px solid rgba(251,191,36,0.3)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      <AlertTriangle size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
      <p style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600, textAlign: 'center' }}>
        🔧 We're currently performing scheduled maintenance. Some services may be temporarily unavailable.
      </p>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: '#a1a1a6', cursor: 'pointer', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <X size={14} />
      </button>
    </div>
  )
}