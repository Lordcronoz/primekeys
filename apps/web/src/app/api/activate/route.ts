import { NextRequest, NextResponse } from 'next/server'
import { getOrder, updateOrder, logPayment, createClientFromOrder } from '@/lib/backend/firestore'
import { sendCredentials, sendCredentialsAlert } from '@/lib/backend/resend'
import { getCredentialsDeliveryLink } from '@/lib/backend/whatsapp'
import { activateSchema } from '@/lib/backend/validate'
import { requireAdmin } from '@/lib/backend/auth'

export async function POST(req: NextRequest) {
  try {
    const adminError = requireAdmin(req)
    if (adminError) return adminError

    const body = await req.json()
    const { error } = activateSchema.validate(body, { abortEarly: false })
    if (error) return NextResponse.json({ message: 'Validation failed', errors: error.details.map(d => d.message) }, { status: 400 })

    const { orderId, credentials } = body
    const order = await getOrder(orderId)
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 })

    const { name, email, phone, product, total, currency, utrNumber, paypalOrderId, paymentMethod, duration } = order

    await sendCredentials({ to: email, name, product, credentials })
    await sendCredentialsAlert({ orderId, name, email, phone, product, credentials })

    await updateOrder(orderId, { status: 'activated', activatedAt: new Date().toISOString() })

    const paymentMethodMap: Record<string, 'upi' | 'paypal' | 'wise'> = { paypal: 'paypal', upi: 'upi', wise: 'wise' }
    await logPayment({
      orderId, clientName: name, clientEmail: email, service: product,
      amount: Number(total) || 0, currency: currency || 'INR',
      utr: utrNumber || '', paypalOrderId: paypalOrderId || '',
      paymentMethod: paymentMethodMap[paymentMethod || ''] || 'upi',
      date: new Date().toISOString().split('T')[0],
    })

    await createClientFromOrder({
      name, email, phone, product,
      duration: Number(duration) || 3,
      total: Number(total) || 0,
      currency: currency || 'INR',
      orderId,
      credentials: {
        email:    credentials.split('\n').find((l: string) => l.toLowerCase().includes('email'))?.split(':')[1]?.trim() || '',
        password: credentials.split('\n').find((l: string) => l.toLowerCase().includes('password'))?.split(':')[1]?.trim() || credentials,
      },
    })

    const waLink = getCredentialsDeliveryLink({ phone, name, product, credentials })
    return NextResponse.json({ message: 'Credentials sent', waLink })
  } catch (err) {
    console.error('activate error:', err)
    return NextResponse.json({ message: 'Failed to activate order' }, { status: 500 })
  }
}
