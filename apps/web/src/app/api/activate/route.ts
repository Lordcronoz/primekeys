import { NextRequest, NextResponse } from 'next/server'
import app, { db, auth } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { sendCredentials, sendCredentialsAlert } from '@/lib/backend/resend'
import { getCredentialsDeliveryLink } from '@/lib/backend/whatsapp'

/** Inline secret check — no firebase-admin dependency */
function checkSecret(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ message: 'ADMIN_SECRET not configured on server' }, { status: 500 })
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
  return null
}

export async function POST(req: NextRequest) {
  try {
    const authError = checkSecret(req)
    if (authError) return authError

    const body = await req.json()
    const { orderId, credentials } = body

    if (!orderId?.trim() || !credentials?.trim()) {
      return NextResponse.json({ message: 'orderId and credentials required' }, { status: 400 })
    }

    // Ensure anonymous session so Firestore rules pass
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }

    // 1. Read order (client SDK — no Admin needed)
    const orderSnap = await getDoc(doc(db, 'orders', orderId))
    if (!orderSnap.exists()) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    const order = orderSnap.data()
    const { name, email, phone, product, total, currency, paymentMethod } = order

    // 2. Send credentials email to customer + admin alert (fire both, non-fatal)
    await Promise.allSettled([
      sendCredentials({ to: email, name, product, credentials }),
      sendCredentialsAlert({ orderId, name, email, phone: phone || '', product, credentials }),
    ])

    // 3. Mark order as activated
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'activated',
      activatedAt: new Date().toISOString(),
    })

    // 4. Log payment record (non-fatal)
    addDoc(collection(db, 'payments'), {
      orderId, clientName: name, clientEmail: email,
      service: product, amount: Number(total) || 0,
      currency: currency || 'INR',
      paymentMethod: paymentMethod || 'upi',
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    }).catch(e => console.warn('[activate] payment log non-fatal:', e))

    const waLink = getCredentialsDeliveryLink({ phone: phone || '', name, product, credentials })
    return NextResponse.json({ message: 'Credentials sent', waLink })
  } catch (err: any) {
    console.error('[activate] error:', err)
    return NextResponse.json({ message: err?.message || 'Failed to activate order' }, { status: 500 })
  }
}
