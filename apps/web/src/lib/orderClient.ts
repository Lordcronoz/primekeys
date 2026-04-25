/**
 * Client-side order creation — writes directly to Firestore using the client SDK.
 * This bypasses the Admin SDK entirely, which requires FIREBASE_SERVICE_ACCOUNT
 * that may not be configured on all deployments.
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'

export interface OrderPayload {
  name: string
  email: string
  phone: string
  product: string
  duration: number
  total: number
  currency: string
  referralCode?: string
  paymentMethod?: string
}

export async function createOrderClient(payload: OrderPayload): Promise<string> {
  // Ensure we have a Firebase auth session (anonymous is fine for guest checkout)
  if (!auth.currentUser) {
    try { await signInAnonymously(auth) } catch { /* user already signed in */ }
  }

  const ref = await addDoc(collection(db, 'orders'), {
    ...payload,
    referralCode: payload.referralCode || '',
    paymentMethod: payload.paymentMethod || 'manual',
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Fire-and-forget: notify the server after the order is created so it can
 * send confirmation emails and WhatsApp alerts without blocking the customer.
 */
export async function notifyOrderAsync(orderId: string, payload: OrderPayload) {
  fetch('/api/order-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, ...payload }),
  }).catch(err => console.warn('Order notify failed (non-critical):', err))
}
