import { Router } from 'express'
import { createOrder } from '../lib/firestore'
import { sendOrderConfirmation, sendNewOrderAlert } from '../lib/resend'
import { getWhatsAppAlertLink } from '../lib/whatsapp'

const router = Router()

/**
 * POST /api/paypal-confirm
 * Called by the frontend immediately after PayPal captures a payment.
 * Creates the order in Firestore as 'activated' (PayPal auto-confirms payment)
 * and fires the invoice email + admin alert.
 */
router.post('/paypal-confirm', async (req, res) => {
  try {
    const {
      paypalOrderId,  // PayPal capture ID
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

    // Create order in Firestore — mark as 'utr_submitted' immediately
    // (PayPal payment is already confirmed, admin just needs to send credentials)
    const orderId = await createOrder({
      name:         name || 'PayPal Customer',
      email,
      phone:        phone || '',
      product,
      duration:     Number(duration) || 1,
      total:        Number(total),
      currency,
      paypalOrderId,
      paymentMethod: 'paypal',
      status:       'utr_submitted', // override default 'pending' — payment confirmed
    })

    // Send invoice email to customer
    await sendOrderConfirmation({
      to:       email,
      name:     name || 'Valued Customer',
      orderId,
      product,
      duration: Number(duration) || 1,
      total:    Number(total),
      currency,
    })

    // Send admin alert
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

    // WA alert link for Aaron
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
