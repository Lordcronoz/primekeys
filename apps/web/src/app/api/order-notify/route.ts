import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmation, sendNewOrderAlert } from '@/lib/backend/resend'
import { getWhatsAppAlertLink } from '@/lib/backend/whatsapp'

/**
 * Lightweight notification route — called AFTER the order is already saved
 * to Firestore via the client SDK. Just sends emails + logs WA link.
 * Never fails the customer-facing flow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, name, email, phone, product, duration, total, currency } = body

    if (!orderId || !name || !email || !product) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    const waLink = getWhatsAppAlertLink({ name, product, duration, total, currency, orderId })
    console.log(`[notify] Order ${orderId} | WA: ${waLink}`)

    // Fire emails asynchronously — don't block response
    Promise.allSettled([
      sendOrderConfirmation({ to: email, name, orderId, product, duration, total, currency }),
      sendNewOrderAlert({ orderId, name, email, phone: phone || '', product, duration, total, currency }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[notify] email[${i}] failed for ${orderId}:`, r.reason)
        }
      })
    })

    return NextResponse.json({ message: 'Notified', waLink }, { status: 200 })
  } catch (err) {
    console.error('[order-notify] error:', err)
    return NextResponse.json({ message: 'Notify failed' }, { status: 500 })
  }
}
