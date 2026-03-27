import { Router }  from 'express'
import { createOrder }                            from '../lib/firestore'
import { sendOrderConfirmation, sendNewOrderAlert } from '../lib/resend'
import { getWhatsAppAlertLink }                   from '../lib/whatsapp'

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
router.post('/paypal-confirm', async (req, res) => {
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

    if (!paypalOrderId || !email || !product) {
      res.status(400).json({ message: 'Missing required fields' })
      return
    }

    // ── 1. Verify the capture with PayPal ─────────────────
    let verified = { status: 'UNVERIFIED', amount: '0', currency: currency || 'USD' }
    try {
      const token = await getPayPalAccessToken()
      verified    = await verifyPayPalCapture(paypalOrderId, token)
    } catch (verifyErr) {
      console.error('PayPal verification error:', verifyErr)
      // If credentials not set yet, skip verification in dev — block in prod
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

    // ── 2. Create order in Firestore ───────────────────────
    const orderId = await createOrder({
      name:          name || 'PayPal Customer',
      email,
      phone:         phone || '',
      product,
      duration:      Number(duration) || 1,
      total:         Number(total),
      currency,
      paypalOrderId,
      paymentMethod: 'paypal',
      status:        'utr_submitted', // payment already confirmed by PayPal
    })

    // ── 3. Send invoice email (PayPal-specific section) ────
    await sendOrderConfirmation({
      to:            email,
      name:          name || 'Valued Customer',
      orderId,
      product,
      duration:      Number(duration) || 1,
      total:         Number(total),
      currency,
      paymentMethod: 'paypal',
      paypalOrderId,
    })

    // ── 4. Admin alert ─────────────────────────────────────
    await sendNewOrderAlert({
      orderId,
      name:     name || 'PayPal Customer',
      email,
      phone:    phone || 'N/A',
      product,
      duration: Number(duration) || 1,
      total:    Number(total),
      currency,
    })

    // ── 5. WA alert link ───────────────────────────────────
    const waLink = getWhatsAppAlertLink({
      name:     name || 'PayPal Customer',
      product,
      duration: Number(duration) || 1,
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
