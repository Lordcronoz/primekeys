import { Router } from 'express'
import { requireAdmin } from '../middleware/auth'
import { validate, activateSchema } from '../middleware/validate'
import { getOrder, updateOrder } from '../lib/firestore'
import { sendCredentials } from '../lib/resend'
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

    const { name, email, phone, product } = order as any

    // Send credentials email
    await sendCredentials({ to: email, name, product, credentials })

    // Update order status
    await updateOrder(orderId, {
      status: 'activated',
      activatedAt: new Date().toISOString(),
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