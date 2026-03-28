import * as admin from 'firebase-admin'

// ── Init ─────────────────────────────────────────────────
if (!admin.apps.length) {
  const serviceAccount = require('../../service-account.json')
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

export const adminAuth = admin.auth()
export const db        = admin.firestore()

// ── Shared types ─────────────────────────────────────────
export interface Order {
  id:            string
  name:          string
  email:         string
  phone:         string
  product:       string
  duration:       number
  total:         number
  currency:      string
  status:        string
  utrNumber?:     string
  paypalOrderId?: string
  paymentMethod?: string
  createdAt?:     any
  updatedAt?:     any
  activatedAt?:   string
}

// ── Helpers ──────────────────────────────────────────────

// Orders
export async function createOrder(data: Record<string, any>) {
  const ref = await db.collection('orders').add({
    ...data,
    status:    'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const doc = await db.collection('orders').doc(orderId).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as Order
}

export async function updateOrder(orderId: string, data: Record<string, any>) {
  await db.collection('orders').doc(orderId).update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })
}

// Clients
export async function createClient(data: Record<string, any>) {
  const ref = await db.collection('clients').add({
    ...data,
    status:    'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function getClients() {
  const snap = await db.collection('clients')
    .orderBy('createdAt', 'desc')
    .get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getClient(clientId: string) {
  const doc = await db.collection('clients').doc(clientId).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

export async function updateClient(clientId: string, data: Record<string, any>) {
  await db.collection('clients').doc(clientId).update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })
}

// Tickets
export async function createTicket(data: Record<string, any>) {
  const ref = await db.collection('tickets').add({
    ...data,
    status:    'open',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  return ref.id
}

// Leads
export async function createLead(data: Record<string, any>) {
  const ref = await db.collection('leads').add({
    ...data,
    status:    'cold',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  return ref.id
}

// UTR dupe check
export async function utrExists(utrNumber: string) {
  const snap = await db.collection('orders')
    .where('utrNumber', '==', utrNumber)
    .limit(1)
    .get()
  return !snap.empty
}

// Payments — written when an order is activated
export async function logPayment(data: {
  orderId: string
  clientName: string
  clientEmail: string
  service: string
  amount: number
  currency: string
  utr?: string
  paypalOrderId?: string
  paymentMethod: 'upi' | 'paypal' | 'wise'
  date: string
}) {
  const ref = await db.collection('payments').add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  return ref.id
}

// Clients — created when an order is activated
export async function createClientFromOrder(orderData: {
  name: string
  email: string
  phone: string
  product: string
  duration: number
  total: number
  currency: string
  orderId: string
  credentials?: { email: string; password: string }
}) {
  const productMap: Record<string, string> = {
    netflix: 'Netflix', spotify: 'Spotify', chatgpt: 'ChatGPT Plus',
    youtube: 'YouTube Premium', disney: 'Disney+', canva: 'Canva Pro',
    amazon: 'Amazon Prime', linkedin: 'LinkedIn Premium', appletv: 'Apple TV+',
  }

  const expiryDate = new Date()
  expiryDate.setMonth(expiryDate.getMonth() + orderData.duration)

  const ref = await db.collection('clients').add({
    name:         orderData.name,
    email:        orderData.email,
    whatsapp:     orderData.phone,
    service:      productMap[orderData.product] || orderData.product,
    productId:    orderData.product,
    plan:         `${orderData.duration} Months`,
    charge:       orderData.total,
    cost:         0,
    source:       'Website',
    referralCode: '',
    credentials:  orderData.credentials || null,
    expiryDate:   expiryDate.toISOString(),
    status:       'active',
    services:     [orderData.product],
    refCount:     0,
    tier:         'bronze',
    notes:        '',
    createdAt:    admin.firestore.FieldValue.serverTimestamp(),
  })
  return ref.id
}

// Get product catalogue count
export async function getProductCount(): Promise<number> {
  const snap = await db.collection('catalogue').doc('config').get()
  if (!snap.exists) return 9
  const data = snap.data()
  if (!data) return 9
  const count = Object.keys(data).filter(k => !k.startsWith('_')).length
  return Math.max(count, 9)
}

// ── Referral / Promo codes ────────────────────────────────────────────────
export async function validateReferralCode(code: string): Promise<{ valid: boolean; discount: number; referrerEmail?: string }> {
  const snap = await db.collection('clients')
    .where('referralCode', '==', code.toUpperCase())
    .limit(1)
    .get()

  if (snap.empty) return { valid: false, discount: 0 }

  const referrer = snap.docs[0].data()
  return { valid: true, discount: 10, referrerEmail: referrer.email }
}

export async function applyReferralReward(clientId: string) {
  await db.collection('clients').doc(clientId).update({
    refCount: admin.firestore.FieldValue.increment(1),
  })
}

// ── Config — UPI, WhatsApp, Wise settings stored in catalogue/config ────────
export async function getConfig(): Promise<Record<string, any>> {
  const snap = await db.collection('catalogue').doc('config').get()
  if (!snap.exists) return {}
  return snap.data() || {}
}

export async function updateConfig(data: Record<string, any>): Promise<void> {
  await db.collection('catalogue').doc('config').set(
    { ...data, _updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )
}

// ── Messaging templates ───────────────────────────────────────────────────
export async function getTemplates(): Promise<Record<string, any>> {
  const snap = await db.collection('catalogue').doc('templates').get()
  if (!snap.exists) return {}
  return snap.data() || {}
}

export async function updateTemplates(data: Record<string, any>): Promise<void> {
  await db.collection('catalogue').doc('templates').set(
    { ...data, _updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )
}