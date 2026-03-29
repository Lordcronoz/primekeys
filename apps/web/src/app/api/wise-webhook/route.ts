import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-signature-sha256')
    const secret    = process.env.WISE_WEBHOOK_SECRET
    const body = await req.json()

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        console.error('WISE_WEBHOOK_SECRET not configured — rejecting webhook')
        return NextResponse.json({ message: 'Webhook secret not configured' }, { status: 500 })
      }
      console.warn('Wise webhook: no secret configured, skipping signature verification')
      return NextResponse.json({ message: 'Webhook received (no verification)' })
    }

    const hmac   = crypto.createHmac('sha256', secret)
    const digest = hmac.update(JSON.stringify(body)).digest('hex')
    if (signature !== digest) return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })

    const { data } = body
    if (!data?.resource?.id) return NextResponse.json({ message: 'Invalid webhook payload' }, { status: 400 })

    console.log('Wise webhook received:', JSON.stringify(data, null, 2))
    return NextResponse.json({ message: 'Webhook received' })
  } catch (err) {
    console.error('wiseWebhook error:', err)
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 })
  }
}
