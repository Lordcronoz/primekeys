import { Router } from 'express'
import { requireAdmin } from '../middleware/auth'
import { validate, activateSchema } from '../middleware/validate'
import { getOrder, updateOrder, logPayment, createClientFromOrder, Order } from '../lib/firestore'
import { sendCredentials, sendCredentialsAlert } from '../lib/resend'
import { getCredentialsDeliveryLink } from '../lib/whatsapp'

const router = Router()

// POST /api/activate — send credentials to customer (admin secret required)
router.post('/activate', requireAdmin, validate(activateSchema), async (req, res) => {
  try {
    const { orderId, credentials } = req.body

    const order = await getOrder(orderId)
    if (!order) {
      res.status(404).json({ message: 'Order not found' })
      return
    }

    const { name, email, phone, product, total, currency, utrNumber, paypalOrderId, paymentMethod, duration } = order as Order

    // Send credentials email to customer
    await sendCredentials({ to: email, name, product, credentials })

    // Send alert to admin (you) with credentials for delivery
    await sendCredentialsAlert({ orderId, name, email, phone, product, credentials })

    // Update order status
    await updateOrder(orderId, {
      status: 'activated',
      activatedAt: new Date().toISOString(),
    })

    // Wire #1: Log payment to payments collection (shows in Profit tab)
    const paymentMethodMap: Record<string, 'upi' | 'paypal' | 'wise'> = {
      paypal: 'paypal',
      upi: 'upi',
      wise: 'wise',
    }
    await logPayment({
      orderId,
      clientName:  name,
      clientEmail: email,
      service:    product,
      amount:     Number(total) || 0,
      currency:   currency || 'INR',
      utr:        utrNumber || '',
      paypalOrderId: paypalOrderId || '',
      paymentMethod: paymentMethodMap[paymentMethod || ''] || 'upi',
      date: new Date().toISOString().split('T')[0],
    })

    // Wire #2: Create client in clients collection (shows in Clients tab + Overview)
    await createClientFromOrder({
      name,
      email,
      phone,
      product,
      duration: Number(duration) || 3,
      total: Number(total) || 0,
      currency: currency || 'INR',
      orderId,
      credentials: {
        email: credentials.split('\n').find((l: string) => l.toLowerCase().includes('email'))?.split(':')[1]?.trim() || '',
        password: credentials.split('\n').find((l: string) => l.toLowerCase().includes('password'))?.split(':')[1]?.trim() || credentials,
      },
    })

    // WA delivery link
    const waLink = getCredentialsDeliveryLink({ phone, name, product, credentials })

    res.json({
      message:  'Credentials sent',
      waLink,
    })
  } catch (err) {
    console.error('activate error:', err)
    res.status(500).json({ message: 'Failed to activate order' })
  }
})

export default router