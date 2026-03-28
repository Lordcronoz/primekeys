import { Router } from 'express'
import { orderLimiter } from '../middleware/rateLimit'
import { validate, orderSchema } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { createOrder, getOrder, validateReferralCode } from '../lib/firestore'
import { sendOrderConfirmation, sendNewOrderAlert } from '../lib/resend'
import { getWhatsAppAlertLink } from '../lib/whatsapp'

const router = Router()

// POST /api/order — create new order
router.post('/order', orderLimiter, validate(orderSchema), async (req, res) => {
  try {
    const { name, email, phone, product, duration, total, currency, referralCode } = req.body

    const orderId = await createOrder({
      name, email, phone, product, duration, total, currency, referralCode: referralCode || '',
    })

    // Email customer
    await sendOrderConfirmation({ to: email, name, orderId, product, duration, total, currency })

    // Email Aaron
    await sendNewOrderAlert({ orderId, name, email, phone, product, duration, total, currency })

    // WhatsApp alert link for Aaron (logged, can be sent via webhook later)
    const waLink = getWhatsAppAlertLink({ name, product, duration, total, currency, orderId })
    console.log('WA Alert:', waLink)

    res.status(201).json({
      message: 'Order created',
      orderId,
      waLink,
    })
  } catch (err) {
    console.error('createOrder error:', err)
    res.status(500).json({ message: 'Failed to create order' })
  }
})

// POST /api/validate-promo — check if a referral/promo code is valid
router.post('/validate-promo', async (req, res) => {
  try {
    const { code } = req.body
    if (!code || code.length < 3) {
      res.json({ valid: false, discount: 0 })
      return
    }
    const result = await validateReferralCode(code)
    res.json(result)
  } catch (err) {
    console.error('validatePromo error:', err)
    res.status(500).json({ message: 'Failed to validate code' })
  }
})

// GET /api/order/:id — get order status
router.get('/order/:id', requireAuth, async (req, res) => {
  try {
    const order = await getOrder(req.params.id as string)
    if (!order) {
      res.status(404).json({ message: 'Order not found' })
      return
    }
    res.json(order)
  } catch (err) {
    console.error('getOrder error:', err)
    res.status(500).json({ message: 'Failed to get order' })
  }
})

export default router