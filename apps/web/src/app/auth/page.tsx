'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShaderAnimation } from '@/components/ui/shader-animation'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
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
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      'auth/user-not-found':        'No account found with this email.',
      'auth/wrong-password':        'Incorrect password.',
      'auth/invalid-credential':    'Invalid email or password.',
      'auth/email-already-in-use':  'An account with this email already exists.',
      'auth/weak-password':         'Password must be at least 6 characters.',
      'auth/invalid-email':         'Please enter a valid email address.',
      'auth/too-many-requests':     'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user':  'Sign-in was cancelled.',
      'auth/popup-blocked':         'Popup was blocked. Please allow popups for this site.',
    }
    return map[code] || 'Something went wrong. Please try again.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
      }
      router.push('/portal')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleSocial = async (provider: 'google' | 'microsoft') => {
    setError(null)
    setSocialLoading(provider)
    try {
      if (provider === 'google') {
        await signInWithPopup(auth, new GoogleAuthProvider())
      } else {
        const msProvider = new OAuthProvider('microsoft.com')
        msProvider.setCustomParameters({ prompt: 'select_account' })
        await signInWithPopup(auth, msProvider)
      }
      router.push('/portal')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setSocialLoading(null)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError('Enter your email above first.'); return }
    setLoading(true)
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setResetSent(true)
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', padding: '80px 24px 24px', position: 'relative',
    }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.35 }}>
        <ShaderAnimation />
      </div>

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 420,
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 28px 0' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 22 }}>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span style={{ color: '#D4AF37' }}>PRIME</span>
              <span style={{ color: '#f5f5f7' }}>KEYS</span>
            </span>
          </Link>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 22 }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setResetSent(false) }} style={{
                flex: 1, height: 34, borderRadius: 9, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: mode === m ? '#D4AF37' : 'transparent',
                color: mode === m ? '#000' : '#a1a1a6',
                transition: 'all 0.2s',
              }}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.03em', marginBottom: 4 }}>
            {mode === 'signin' ? 'Welcome back.' : 'Create account.'}
          </h1>
          <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 20 }}>
            {mode === 'signin' ? 'Sign in to manage your subscriptions.' : 'Join thousands saving on premium apps.'}
          </p>
        </div>

        <div style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {resetSent && (
            <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, fontSize: 12, color: '#4ade80' }}>
              ✓ Password reset email sent. Check your inbox.
            </div>
          )}
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, fontSize: 12, color: '#f87171' }}>
              {error}
            </div>
          )}

          {/* Social buttons — compact row */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleSocial('google')} disabled={!!socialLoading || loading} title="Continue with Google"
              style={{ flex: 1, height: 42, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, cursor: socialLoading || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: '#f5f5f7', fontSize: 13, fontWeight: 600, transition: 'background 0.2s' }}
              onMouseEnter={e => { if (!socialLoading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'}
            >
              {socialLoading === 'google' ? <div style={spinnerStyle} /> : (
                <><svg width="15" height="15" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/></svg>Google</>
              )}
            </button>

            <button onClick={() => handleSocial('microsoft')} disabled={!!socialLoading || loading} title="Continue with Microsoft"
              style={{ flex: 1, height: 42, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, cursor: socialLoading || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: '#f5f5f7', fontSize: 13, fontWeight: 600, transition: 'background 0.2s' }}
              onMouseEnter={e => { if (!socialLoading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'}
            >
              {socialLoading === 'microsoft' ? <div style={spinnerStyle} /> : (
                <><svg width="15" height="15" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>Microsoft</>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 11, color: '#444' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6e6e73', display: 'flex', alignItems: 'center', padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <button type="button" onClick={handleForgotPassword} disabled={loading} style={{ fontSize: 12, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              height: 48, width: '100%', marginTop: 4,
              background: loading ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37, #A8842A)',
              color: '#000', border: 'none', borderRadius: 13,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { if (!loading) { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = '0.9'; el.style.transform = 'scale(1.01)' } }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = '1'; el.style.transform = 'scale(1)' }}
            >
              {loading ? <div style={spinnerStyle} /> : <>{mode === 'signin' ? 'Sign In' : 'Create Account'}<ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6e6e73', marginTop: 4 }}>
            Questions?{' '}
            <a href="https://wa.me/918111956481" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>
              WhatsApp us
            </a>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#a1a1a6', display: 'block', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', height: 44, padding: '0 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 11, color: '#f5f5f7', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }
const spinnerStyle: React.CSSProperties = { width: 15, height: 15, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }