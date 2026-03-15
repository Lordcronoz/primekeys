// WhatsApp alerts via wa.me deep links
// In future this can be replaced with WhatsApp Business API

export function getWhatsAppAlertLink(data: {
  name:     string
  product:  string
  duration: number
  total:    number
  currency: string
  orderId:  string
}) {
  const message = encodeURIComponent(
    `🔔 *New PRIMEKEYS Order*\n\n` +
    `*Order ID:* #${data.orderId.slice(-8).toUpperCase()}\n` +
    `*Customer:* ${data.name}\n` +
    `*Product:* ${data.product}\n` +
    `*Duration:* ${data.duration} month${data.duration > 1 ? 's' : ''}\n` +
    `*Total:* ${data.currency} ${data.total}\n\n` +
    `Awaiting payment confirmation.`
  )
  return `https://wa.me/918111956481?text=${message}`
}

export function getCredentialsDeliveryLink(data: {
  phone:       string
  name:        string
  product:     string
  credentials: string
}) {
  const message = encodeURIComponent(
    `Hi ${data.name}! 👋\n\n` +
    `Your *${data.product}* subscription is ready.\n\n` +
    `*Credentials:*\n${data.credentials}\n\n` +
    `Need help? Just reply here.\n\n` +
    `— PRIMEKEYS Team`
  )
  const phone = data.phone.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${message}`
}

export function getPaymentConfirmedLink(data: {
  phone:    string
  name:     string
  product:  string
  orderId:  string
}) {
  const message = encodeURIComponent(
    `Hi ${data.name}! ✅\n\n` +
    `Payment confirmed for your *${data.product}* subscription.\n` +
    `*Order:* #${data.orderId.slice(-8).toUpperCase()}\n\n` +
    `Your credentials will be delivered within 5 minutes.\n\n` +
    `— PRIMEKEYS Team`
  )
  const phone = data.phone.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${message}`
}