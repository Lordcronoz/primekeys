import { Router } from 'express'
import { validate, upiSchema } from '../middleware/validate'
import { getOrder, updateOrder, utrExists, Order } from '../lib/firestore'
import { getPaymentConfirmedLink } from '../lib/whatsapp'
import crypto from 'crypto'

const router = Router()

// POST /api/verify-upi — customer submits UTR number
router.post('/verify-upi', validate(upiSchema), async (req, res) => {
  try {
    const { orderId, utrNumber } = req.body

    // Dupe UTR check
    const exists = await utrExists(utrNumber)
    if (exists) {
      res.status(400).json({ message: 'This UTR has already been used.' })
      return
    }

    const order = await getOrder(orderId)
    if (!order) {
      res.status(404).json({ message: 'Order not found' })
      return
    }

    const orderData = order as Order
    if (orderData.status !== 'pending') {
      res.status(400).json({ message: 'Order already processed' })
      return
    }

    await updateOrder(orderId, {
      utrNumber,
      status: 'utr_submitted',
    })

    // WA link for Aaron to confirm manually
    const waLink = getPaymentConfirmedLink({
      phone:   orderData.phone,
      name:    orderData.name,
      product: orderData.product,
      orderId,
    })
    console.log('Payment WA link:', waLink)

    res.json({
      message: 'UTR submitted successfully. Verifying payment.',
      waLink,
    })
  } catch (err) {
    console.error('verifyUPI error:', err)
    res.status(500).json({ message: 'Failed to submit UTR' })
  }
})

// POST /api/wise-webhook — Wise payment confirmation
router.post('/wise-webhook', async (req, res) => {
  try {
    const signature = req.headers['x-signature-sha256'] as string
    const secret    = process.env.WISE_WEBHOOK_SECRET

    // Fail-safe: block in production if no secret configured
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        console.error('WISE_WEBHOOK_SECRET not configured — rejecting webhook')
        res.status(500).json({ message: 'Webhook secret not configured' })
        return
      }
      console.warn('Wise webhook: no secret configured, skipping signature verification')
      res.json({ message: 'Webhook received (no verification)' })
      return
    }

    const hmac   = crypto.createHmac('sha256', secret)
    const digest = hmac.update(JSON.stringify(req.body)).digest('hex')
    if (signature !== digest) {
      res.status(401).json({ message: 'Invalid signature' })
      return
    }

    const { data } = req.body
    if (!data?.resource?.id) {
      res.status(400).json({ message: 'Invalid webhook payload' })
      return
    }

    console.log('Wise webhook received:', JSON.stringify(data, null, 2))
    res.json({ message: 'Webhook received' })
  } catch (err) {
    console.error('wiseWebhook error:', err)
    res.status(500).json({ message: 'Webhook processing failed' })
  }
})

export default router