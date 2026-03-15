'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShaderAnimation } from '@/components/ui/shader-animation'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire to firebase auth
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', padding: 24, position: 'relative', flexDirection: 'column', gap: 20,
    }}>
      {/* Shader background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.35 }}>
        <ShaderAnimation />
      </div>

      {/* DEV bypass banner */}
      {DEV_BYPASS && (
        <div style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 440,
          padding: '10px 18px',
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.28)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, color: '#D4AF37',
              letterSpacing: '0.15em', padding: '2px 8px',
              background: 'rgba(212,175,55,0.14)', borderRadius: 6,
            }}>DEV MODE</span>
            <span style={{ fontSize: 13, color: '#a1a1a6' }}>Firebase auth is bypassed.</span>
          </div>
          <button
            onClick={() => router.push('/portal')}
            style={{
              height: 32, padding: '0 16px',
              background: 'linear-gradient(135deg, #D4AF37, #C49A20)',
              color: '#000', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Go to Portal →
          </button>
        </div>
      )}

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 440,
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, overflow: 'hidden',
      }}>
        <div style={{ padding: '32px 32px 0' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span style={{ color: '#D4AF37' }}>PRIME</span>
              <span style={{ color: '#f5f5f7' }}>KEYS</span>
            </span>
          </Link>

          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.05)',
            borderRadius: 12, padding: 4, marginBottom: 32,
          }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, height: 36, borderRadius: 10, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: mode === m ? '#D4AF37' : 'transparent',
                color: mode === m ? '#000' : '#a1a1a6',
                transition: 'all 0.2s',
              }}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.03em', marginBottom: 6 }}>
            {mode === 'signin' ? 'Welcome back.' : 'Create account.'}
          </h1>
          <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 32 }}>
            {mode === 'signin' ? 'Sign in to manage your subscriptions.' : 'Join thousands saving on premium apps.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6', display: 'block', marginBottom: 8 }}>Full Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Aaron Joy Thomas" required={mode === 'signup'}
                style={{
                  width: '100%', height: 48, padding: '0 16px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 12, color: '#f5f5f7', fontSize: 15, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6', display: 'block', marginBottom: 8 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={{
                width: '100%', height: 48, padding: '0 16px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 12, color: '#f5f5f7', fontSize: 15, outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6', display: 'block', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: '100%', height: 48, padding: '0 48px 0 16px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 12, color: '#f5f5f7', fontSize: 15, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#6e6e73',
                display: 'flex', alignItems: 'center',
              }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <a href="#" style={{ fontSize: 13, color: '#D4AF37', textDecoration: 'none' }}>Forgot password?</a>
            </div>
          )}

          <button type="submit" style={{
            height: 52, width: '100%', marginTop: 8,
            background: 'linear-gradient(135deg, #D4AF37, #A8842A)',
            color: '#000', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = '0.9'; el.style.transform = 'scale(1.01)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = '1'; el.style.transform = 'scale(1)' }}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
            <ArrowRight size={18} />
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6e6e73', marginTop: 4 }}>
            Questions?{' '}
            <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer"
              style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>
              WhatsApp us
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
