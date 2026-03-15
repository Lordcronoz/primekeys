import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyCHWc7r9W6GjGcNKYhQPxPqCETnUkEcCSM',
  authDomain:        'primekeys-ops.firebaseapp.com',
  projectId:         'primekeys-ops',
  storageBucket:     'primekeys-ops.firebasestorage.app',
  messagingSenderId: '378777855555',
  appId:             '1:378777855555:web:3b97e7a9dd5c5590c0d6f6',
  measurementId:     'G-7XHPKNPC5G',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db   = getFirestore(app)
export default app