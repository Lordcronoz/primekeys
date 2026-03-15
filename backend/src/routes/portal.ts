import { Router } from 'express'
import { requireAuth, requireTeam } from '../middleware/auth'
import { validate, clientSchema, ticketSchema, renewSchema } from '../middleware/validate'
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  createTicket,
  createLead,
} from '../lib/firestore'

const router = Router()

// POST /api/client — add new client (team only)
router.post('/client', requireAuth, requireTeam, validate(clientSchema), async (req, res) => {
  try {
    const clientId = await createClient(req.body)
    res.status(201).json({ message: 'Client added', clientId })
  } catch (err) {
    console.error('createClient error:', err)
    res.status(500).json({ message: 'Failed to add client' })
  }
})

// GET /api/clients — list all clients (team only)
router.get('/clients', requireAuth, requireTeam, async (_req, res) => {
  try {
    const clients = await getClients()
    res.json(clients)
  } catch (err) {
    console.error('getClients error:', err)
    res.status(500).json({ message: 'Failed to fetch clients' })
  }
})

// GET /api/client/:id — get single client (team only)
router.get('/client/:id', requireAuth, requireTeam, async (req, res) => {
  try {
    const client = await getClient(req.params.id)
    if (!client) {
      res.status(404).json({ message: 'Client not found' })
      return
    }
    res.json(client)
  } catch (err) {
    console.error('getClient error:', err)
    res.status(500).json({ message: 'Failed to fetch client' })
  }
})

// POST /api/renew — renew client subscription (team only)
router.post('/renew', requireAuth, requireTeam, validate(renewSchema), async (req, res) => {
  try {
    const { clientId, newExpiry, charge } = req.body
    await updateClient(clientId, {
      expiryDate: newExpiry,
      charge,
      status: 'active',
    })
    res.json({ message: 'Subscription renewed' })
  } catch (err) {
    console.error('renew error:', err)
    res.status(500).json({ message: 'Failed to renew' })
  }
})

// POST /api/ticket — create support ticket (any user)
router.post('/ticket', requireAuth, validate(ticketSchema), async (req, res) => {
  try {
    const ticketId = await createTicket(req.body)
    res.status(201).json({ message: 'Ticket created', ticketId })
  } catch (err) {
    console.error('createTicket error:', err)
    res.status(500).json({ message: 'Failed to create ticket' })
  }
})

// POST /api/lead — add lead (team only)
router.post('/lead', requireAuth, requireTeam, async (req, res) => {
  try {
    const leadId = await createLead(req.body)
    res.status(201).json({ message: 'Lead added', leadId })
  } catch (err) {
    console.error('createLead error:', err)
    res.status(500).json({ message: 'Failed to add lead' })
  }
})

export default router