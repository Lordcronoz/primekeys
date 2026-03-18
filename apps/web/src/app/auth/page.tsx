'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShaderAnimation } from '@/components/ui/shader-animation'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      'auth/user-not-found':       'No account found with this email.',
      'auth/wrong-password':       'Incorrect password.',
      'auth/invalid-credential':   'Invalid email or password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password':        'Password must be at least 6 characters.',
      'auth/invalid-email':        'Please enter a valid email address.',
      'auth/too-many-requests':    'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    }
    return map[code] || 'Something went wrong. Please try again.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
      }
      router.push('/portal')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      router.push('/portal')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError('Enter your email above first.'); return }
    setLoading(true)
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
      setResetSent(true)
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
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

          {/* Tab toggle */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.05)',
            borderRadius: 12, padding: 4, marginBottom: 32,
          }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setResetSent(false) }} style={{
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

        <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Reset sent banner */}
          {resetSent && (
            <div style={{ padding: '12px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, fontSize: 13, color: '#4ade80' }}>
              ✓ Password reset email sent. Check your inbox.
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, fontSize: 13, color: '#f87171' }}>
              {error}
            </div>
          )}

          {/* Google button */}
          <button onClick={handleGoogle} disabled={loading} style={{
            height: 48, width: '100%',
            background: 'rgba(255,255,255,0.05)',
            color: '#f5f5f7', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14,
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: '#444' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a6', display: 'block', marginBottom: 8 }}>Full Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Aaron Joy Thomas" required={mode === 'signup'}
                  style={inputStyle}
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
                style={inputStyle}
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
                  style={{ ...inputStyle, paddingRight: 48 }}
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
                <button type="button" onClick={handleForgotPassword} disabled={loading}
                  style={{ fontSize: 13, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              height: 52, width: '100%', marginTop: 4,
              background: loading ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37, #A8842A)',
              color: '#000', border: 'none', borderRadius: 14,
              fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { if (!loading) { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = '0.9'; el.style.transform = 'scale(1.01)' } }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = '1'; el.style.transform = 'scale(1)' }}
            >
              {loading ? (
                <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>{mode === 'signin' ? 'Sign In' : 'Create Account'}<ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6e6e73', marginTop: 4 }}>
            Questions?{' '}
            <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer"
              style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>
              WhatsApp us
            </a>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 16px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 12, color: '#f5f5f7', fontSize: 15, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
}