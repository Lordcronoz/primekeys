'use client'
import { TEAM_ROLES } from '@primekeys/shared'

interface TaskStats {
  email: string
  done: number
  inProgress: number
  pending: number
  blocked: number
  overdue: number
}

interface PerformanceSectionProps {
  taskStats: TaskStats[]
}

export function PerformanceSection({ taskStats }: PerformanceSectionProps) {
  // Fallback mock if no real data
  const mock: TaskStats[] = Object.keys(TEAM_ROLES).map((email, i) => ({
    email,
    done:       [4, 2, 6, 1][i] ?? 0,
    inProgress: [1, 2, 0, 1][i] ?? 0,
    pending:    [0, 1, 1, 2][i] ?? 0,
    blocked:    [0, 1, 0, 0][i] ?? 0,
    overdue:    [0, 1, 0, 1][i] ?? 0,
  }))
  const data = taskStats.length > 0 ? taskStats : mock

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em' }}>Team Performance</h2>
        <p style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Based on task completions and activity</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.map(member => {
          const info = TEAM_ROLES[member.email as keyof typeof TEAM_ROLES]
          if (!info) return null
          const total = member.done + member.inProgress + member.pending + member.blocked
          const rate  = total > 0 ? Math.round((member.done / total) * 100) : 0
          const isFounder = info.role === 'Founder & CEO'

          return (
            <div key={member.email} style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${isFounder ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 16, padding: '18px 22px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: isFounder ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isFounder ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800,
                  color: isFounder ? '#D4AF37' : '#a1a1a6',
                }}>{info.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f7' }}>{info.name}</p>
                    {isFounder && <span style={{ fontSize: 9, fontWeight: 700, color: '#D4AF37', background: 'rgba(212,175,55,0.12)', padding: '1px 6px', borderRadius: 4, letterSpacing: '0.06em' }}>FOUNDER</span>}
                  </div>
                  <p style={{ fontSize: 11, color: '#555' }}>{info.title}</p>
                </div>
                {/* Completion rate */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: rate >= 70 ? '#4ade80' : rate >= 40 ? '#fbbf24' : '#f87171', letterSpacing: '-0.02em' }}>{rate}%</p>
                  <p style={{ fontSize: 10, color: '#444' }}>completion</p>
                </div>
              </div>

              {/* Task breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Done',     value: member.done,       color: '#4ade80' },
                  { label: 'Active',   value: member.inProgress, color: '#60a5fa' },
                  { label: 'Pending',  value: member.pending,    color: '#555'    },
                  { label: 'Blocked',  value: member.blocked,    color: '#f87171' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '8px 0', borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</p>
                    <p style={{ fontSize: 10, color: '#444' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${rate}%`, background: rate >= 70 ? '#4ade80' : rate >= 40 ? '#fbbf24' : '#f87171', borderRadius: 4, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${rate >= 70 ? '#4ade80' : rate >= 40 ? '#fbbf24' : '#f87171'}66` }} />
              </div>

              {member.overdue > 0 && (
                <p style={{ fontSize: 11, color: '#f87171', marginTop: 8 }}>⚠ {member.overdue} overdue task{member.overdue > 1 ? 's' : ''}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
