import { NextRequest, NextResponse } from 'next/server'
import { sendCartOrderConfirmation, sendCartAdminAlert } from '@/lib/backend/resend'

/**
 * Sends a combined thank-you email to the customer (all order IDs in one)
 * and a cart order alert to the admin. Called fire-and-forget from the client
 * after all orders are saved to Firestore.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, currency, paymentMethod, items } = body

    if (!email || !name || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Fire both in parallel — non-blocking from the client's perspective
    Promise.allSettled([
      sendCartOrderConfirmation({ to: email, name, currency, paymentMethod: paymentMethod || 'manual', items }),
      sendCartAdminAlert({ name, email, phone: phone || '', currency, paymentMethod: paymentMethod || 'manual', items }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[cart-notify] email[${i}] failed:`, r.reason)
        }
      })
    })

    return NextResponse.json({ message: 'Notifications queued' }, { status: 200 })
  } catch (err) {
    console.error('[cart-notify] error:', err)
    return NextResponse.json({ message: 'Notify failed' }, { status: 500 })
  }
}
