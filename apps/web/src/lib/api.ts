const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function request(path: string, options: RequestInit = {}) {
  const res  = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export async function createOrder(payload: {
  name: string
  email: string
  phone: string
  product: string
  duration: number
  total: number
  currency: string
}) {
  return request('/api/order', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function verifyUPI(payload: { orderId: string; utrNumber: string }) {
  return request('/api/verify-upi', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function addClient(clientData: Record<string, unknown>, idToken: string) {
  return request('/api/client', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(clientData),
  })
}

export async function getClients(idToken: string) {
  return request('/api/clients', {
    headers: { Authorization: `Bearer ${idToken}` },
  })
}

export async function addTicket(
  payload: { uid: string; name: string; email: string; message: string },
  idToken: string
) {
  return request('/api/ticket', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(payload),
  })
}
export async function activateOrder(
  payload: { orderId: string; credentials: string },
  adminSecret: string
) {
  return request('/api/activate', {
    method: 'POST',
    headers: { 'x-admin-secret': adminSecret },
    body: JSON.stringify(payload),
  })
}

export async function getOrder(orderId: string, idToken: string) {
  return request(`/api/order/${orderId}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  })
}

export async function renewClient(
  payload: { clientId: string; newExpiry: string; charge: number },
  idToken: string
) {
  return request('/api/renew', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(payload),
  })
}