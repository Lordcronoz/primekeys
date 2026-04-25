import { NextRequest, NextResponse } from 'next/server'
import { createOrder, getOrder } from '@/lib/backend/firestore'
import { sendOrderConfirmation, sendNewOrderAlert } from '@/lib/backend/resend'
import { getWhatsAppAlertLink } from '@/lib/backend/whatsapp'
import { orderSchema } from '@/lib/backend/validate'

export async function POST(req: NextRequest) {
  let orderId: string | null = null
  let stage = 'parse'

  try {
    stage = 'parse'
    const body = await req.json()

    stage = 'validate'
    const { error } = orderSchema.validate(body, { abortEarly: false })
    if (error) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.details.map(d => d.message) },
        { status: 400 },
      )
    }

    const { name, email, phone, product, duration, total, currency, referralCode } = body

    // ── 1. Save to Firestore ────────────────────────────────
    stage = 'firestore'
    orderId = await createOrder({
      name, email, phone, product, duration, total, currency,
      referralCode: referralCode || '',
    })

    // ── 2. Notifications (non-fatal, fire-and-forget) ────────
    stage = 'notifications'
    const waLink = getWhatsAppAlertLink({ name, product, duration, total, currency, orderId })
    console.log('WA Alert:', waLink)

    Promise.allSettled([
      sendOrderConfirmation({ to: email, name, orderId, product, duration, total, currency }),
      sendNewOrderAlert({ orderId, name, email, phone, product, duration, total, currency }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[order/${orderId}] notification[${i}] failed:`, r.reason)
        }
      })
    })

    return NextResponse.json({ message: 'Order created', orderId, waLink }, { status: 201 })

  } catch (err: any) {
    const errMsg = err?.message || String(err)
    console.error(`[order] FAILED at stage="${stage}" orderId=${orderId}:`, errMsg, err)

    // Order was saved — don't block the customer
    if (orderId) {
      return NextResponse.json({ message: 'Order created', orderId }, { status: 201 })
    }

    // Surface a readable reason (not the raw stack) to help diagnose
    const reason = stage === 'firestore'
      ? `Database error: ${errMsg}`
      : stage === 'parse'
        ? 'Could not read request body'
        : errMsg

    return NextResponse.json({ message: reason }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const token = authHeader.split(' ')[1]
    const { adminAuth } = await import('@/lib/backend/firestore')
    await adminAuth.verifyIdToken(token)
    const { searchParams } = new URL(req.url)
    const order = await getOrder(searchParams.get('id') || '')
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}
