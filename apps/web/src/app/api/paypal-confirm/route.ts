import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/backend/firestore'
import { sendOrderConfirmation, sendNewOrderAlert } from '@/lib/backend/resend'
import { getWhatsAppAlertLink } from '@/lib/backend/whatsapp'
import { verifyPrice, calcServerPrice } from '@/lib/backend/pricing'
import { paypalConfirmSchema } from '@/lib/backend/validate'

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

async function verifyPayPalCapture(orderId: string, token: string) {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error } = paypalConfirmSchema.validate(body, { abortEarly: false })
    if (error) return NextResponse.json({ message: 'Validation failed', errors: error.details.map(d => d.message) }, { status: 400 })

    const { paypalOrderId, name, email, phone, product, duration, total, currency } = body
    const durationNum = Number(duration)

    if (!verifyPrice(product, durationNum, currency, Number(total))) {
      const { expectedTotal } = calcServerPrice(product, durationNum, currency)
      console.warn('Price mismatch on PayPal order:', { product, duration: durationNum, currency, submitted: total, expected: expectedTotal })
      return NextResponse.json({ message: 'Price mismatch — please refresh and try again', expectedTotal, currency }, { status: 400 })
    }

    let verified = { status: 'UNVERIFIED', amount: '0', currency: currency || 'USD' }
    try {
      const token = await getPayPalAccessToken()
      verified    = await verifyPayPalCapture(paypalOrderId, token)
    } catch (verifyErr) {
      console.error('PayPal verification error:', verifyErr)
      if (process.env.NODE_ENV === 'production') return NextResponse.json({ message: 'Could not verify payment with PayPal' }, { status: 500 })
    }

    if (verified.status !== 'COMPLETED' && verified.status !== 'UNVERIFIED') {
      console.warn('PayPal capture not completed:', verified.status, paypalOrderId)
      return NextResponse.json({ message: `Payment not completed (status: ${verified.status})` }, { status: 402 })
    }

    const orderId = await createOrder({
      name, email, phone: phone || '', product,
      duration: durationNum, total: Number(total), currency,
      paypalOrderId, paymentMethod: 'paypal', status: 'utr_submitted',
    })

    await sendOrderConfirmation({ to: email, name, orderId, product, duration: durationNum, total: Number(total), currency, paymentMethod: 'paypal', paypalOrderId })
    await sendNewOrderAlert({ orderId, name, email, phone: phone || 'N/A', product, duration: durationNum, total: Number(total), currency, paymentMethod: 'paypal' })
    const waLink = getWhatsAppAlertLink({ name, product, duration: durationNum, total: Number(total), currency, orderId })
    console.log('PayPal order confirmed:', orderId, '| WA:', waLink)
    return NextResponse.json({ message: 'Order confirmed', orderId, waLink }, { status: 201 })
  } catch (err) {
    console.error('paypal-confirm error:', err)
    return NextResponse.json({ message: 'Failed to confirm PayPal order' }, { status: 500 })
  }
}
