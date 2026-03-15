'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminDashboard from '@/components/ui/dashboard-with-collapsible-sidebar'

export default function AdminPage() {
  const { isTeam, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isTeam) router.replace('/portal')
  }, [isTeam, loading, router])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36,
          border: '2px solid rgba(212,175,55,0.2)',
          borderTopColor: '#D4AF37',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: 14, color: '#555' }}>Verifying access…</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!isTeam) return null

  return <AdminDashboard />
}
