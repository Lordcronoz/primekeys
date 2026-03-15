'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { TEAM_ROLES } from '@primekeys/shared'

// ─── Dev bypass ───────────────────────────────────────────────────────────────
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

const MOCK_USER = {
  uid: 'dev-user-000',
  email: 'aaronjthomas.cj@gmail.com',
  displayName: 'Aaron Joy Thomas',
  emailVerified: true,
} as unknown as User

const MOCK_USER_DATA = {
  name: 'Aaron Joy Thomas',
  email: 'aaronjthomas.cj@gmail.com',
  role: 'Founder & CEO',
  refCode: 'PRIMEAARON',
  refCount: 3,
  refReward: 30,
  createdAt: '2025-01-15T00:00:00.000Z',
}


// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null
  userData: any | null
  role: string | null
  loading: boolean
  isTeam: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ── DEV BYPASS — skip Firebase entirely ──────────────────────────────────
    if (DEV_BYPASS) {
      setUser(MOCK_USER)
      setUserData(MOCK_USER_DATA)
      setRole(TEAM_ROLES[MOCK_USER.email as keyof typeof TEAM_ROLES]?.role ?? 'Founder & CEO')
      setLoading(false)
      return
    }

    // ── REAL Firebase auth ────────────────────────────────────────────────────
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser)
          
          const email = firebaseUser.email || ''
          const teamRole = TEAM_ROLES[email as keyof typeof TEAM_ROLES]
          
          let firestoreRole = null
          let finalUserData = null

          const userRef = doc(db, 'users', firebaseUser.uid)
          const userSnap = await getDoc(userRef)
          
          if (userSnap.exists()) {
            finalUserData = userSnap.data()
            firestoreRole = finalUserData.role
          } else {
            const newUser = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              role: teamRole ? teamRole.role : 'client',
              refCode: '',
              refCount: 0,
              refReward: 0,
              createdAt: new Date().toISOString()
            }
            await setDoc(userRef, newUser)
            finalUserData = newUser
            firestoreRole = newUser.role
          }

          setUserData(finalUserData)
          setRole(teamRole ? teamRole.role : firestoreRole)
        } else {
          setUser(null)
          setUserData(null)
          setRole(null)
        }
      } catch (error) {
        console.error("Auth state error:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    if (DEV_BYPASS) return // no-op in bypass mode
    await firebaseSignOut(auth)
  }

  const isTeam = role !== 'client' && role !== null

  return (
    <AuthContext.Provider value={{ user, userData, role, loading, isTeam, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

