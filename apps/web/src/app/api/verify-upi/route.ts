import { NextRequest, NextResponse } from 'next/server'
import { getOrder, updateOrder, utrExists } from '@/lib/backend/firestore'
import { getPaymentConfirmedLink } from '@/lib/backend/whatsapp'
import { upiSchema } from '@/lib/backend/validate'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error } = upiSchema.validate(body, { abortEarly: false })
    if (error) return NextResponse.json({ message: 'Validation failed', errors: error.details.map(d => d.message) }, { status: 400 })

    const { orderId, utrNumber } = body
    const exists = await utrExists(utrNumber)
    if (exists) return NextResponse.json({ message: 'This UTR has already been used.' }, { status: 400 })

    const order = await getOrder(orderId)
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    if (order.status !== 'pending') return NextResponse.json({ message: 'Order already processed' }, { status: 400 })

    await updateOrder(orderId, { utrNumber, status: 'utr_submitted' })
    const waLink = getPaymentConfirmedLink({ phone: order.phone, name: order.name, product: order.product, orderId })
    console.log('Payment WA link:', waLink)
    return NextResponse.json({ message: 'UTR submitted successfully. Verifying payment.', waLink })
  } catch (err) {
    console.error('verifyUPI error:', err)
    return NextResponse.json({ message: 'Failed to submit UTR' }, { status: 500 })
  }
}
