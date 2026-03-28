import { Router }  from 'express'
import { createOrder }                            from '../lib/firestore'
import { sendOrderConfirmation, sendNewOrderAlert } from '../lib/resend'
import { getWhatsAppAlertLink }                   from '../lib/whatsapp'
import { verifyPrice }                            from '../lib/pricing'
import { validate, paypalConfirmSchema }          from '../middleware/validate'

const router = Router()

// ── PayPal helpers ─────────────────────────────────────────
async function getPayPalAccessToken(): Promise<string> {
  const clientId     = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const base         = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com'

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

async function verifyPayPalCapture(orderId: string, token: string): Promise<{ status: string; amount: string; currency: string }> {
  const base = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com'

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`PayPal order lookup failed: ${res.status}`)
  const data = await res.json() as {
    status: string
    purchase_units: Array<{ payments?: { captures?: Array<{ amount: { value: string; currency_code: string } }> } }>
  }

  const capture  = data.purchase_units?.[0]?.payments?.captures?.[0]
  const amount   = capture?.amount?.value   || '0'
  const currency = capture?.amount?.currency_code || 'USD'

  return { status: data.status, amount, currency }
}

// ── POST /api/paypal-confirm ───────────────────────────────
router.post('/paypal-confirm', validate(paypalConfirmSchema), async (req, res) => {
  try {
    const {
      paypalOrderId,
      name,
      email,
      phone,
      product,
      duration,
      total,
      currency,
    } = req.body

    // ── 1. Server-side price verification ─────────────────
    const durationNum = Number(duration)
    if (!verifyPrice(product, durationNum, currency, Number(total))) {
      const { expectedTotal } = await import('../lib/pricing').then(m =>
        m.calcServerPrice(product, durationNum, currency)
      )
      console.warn('Price mismatch on PayPal order:', {
        product, duration: durationNum, currency,
        submitted: total, expected: expectedTotal,
      })
      res.status(400).json({
        message:      'Price mismatch — please refresh and try again',
        expectedTotal: expectedTotal,
        currency,
      })
      return
    }

    // ── 2. Verify the capture with PayPal ─────────────────
    let verified = { status: 'UNVERIFIED', amount: '0', currency: currency || 'USD' }
    try {
      const token = await getPayPalAccessToken()
      verified    = await verifyPayPalCapture(paypalOrderId, token)
    } catch (verifyErr) {
      console.error('PayPal verification error:', verifyErr)
      if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ message: 'Could not verify payment with PayPal' })
        return
      }
    }

    if (verified.status !== 'COMPLETED' && verified.status !== 'UNVERIFIED') {
      console.warn('PayPal capture not completed:', verified.status, paypalOrderId)
      res.status(402).json({ message: `Payment not completed (status: ${verified.status})` })
      return
    }

    // ── 3. Create order in Firestore ───────────────────────
    const orderId = await createOrder({
      name:          name,
      email,
      phone:         phone || '',
      product,
      duration:      durationNum,
      total:         Number(total),
      currency,
      paypalOrderId,
      paymentMethod: 'paypal',
      status:        'utr_submitted',
    })

    // ── 4. Send invoice email (PayPal-specific section) ────
    await sendOrderConfirmation({
      to:            email,
      name,
      orderId,
      product,
      duration:      durationNum,
      total:         Number(total),
      currency,
      paymentMethod: 'paypal',
      paypalOrderId,
    })

    // ── 5. Admin alert ─────────────────────────────────────
    await sendNewOrderAlert({
      orderId,
      name,
      email,
      phone:         phone || 'N/A',
      product,
      duration:      durationNum,
      total:         Number(total),
      currency,
      paymentMethod: 'paypal',
    })

    // ── 6. WA alert link ───────────────────────────────────
    const waLink = getWhatsAppAlertLink({
      name,
      product,
      duration: durationNum,
      total:    Number(total),
      currency,
      orderId,
    })
    console.log('PayPal order confirmed:', orderId, '| WA:', waLink)

    res.status(201).json({ message: 'Order confirmed', orderId, waLink })
  } catch (err) {
    console.error('paypal-confirm error:', err)
    res.status(500).json({ message: 'Failed to confirm PayPal order' })
  }
})

export default router
