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

export async function getOrder(orderId: string) {
  const doc = await db.collection('orders').doc(orderId).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
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