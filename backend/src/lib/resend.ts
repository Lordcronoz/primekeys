import dotenv from 'dotenv'
dotenv.config()

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'PRIMEKEYS <noreply@primekeys.in>'

// ── Order confirmation to customer ───────────────────────
export async function sendOrderConfirmation(data: {
  to:       string
  name:     string
  orderId:  string
  product:  string
  duration: number
  total:    number
  currency: string
}) {
  await resend.emails.send({
    from:    FROM,
    to:      data.to,
    subject: `Order Confirmed — ${data.product} | PRIMEKEYS`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#000;color:#f0f0f0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;border:1px solid rgba(212,175,55,0.2)">
        <div style="margin-bottom:32px">
          <span style="font-size:22px;font-weight:700;color:#D4AF37">PRIME</span><span style="font-size:22px;font-weight:700;color:#fff">KEYS</span>
        </div>
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Order Confirmed ✓</h2>
        <p style="color:#999;margin-bottom:32px">Hi ${data.name}, your order has been received.</p>
        <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #222">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="color:#666">Order ID</span>
            <span style="font-family:monospace;color:#D4AF37">#${data.orderId.slice(-8).toUpperCase()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="color:#666">Product</span>
            <span>${data.product}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="color:#666">Duration</span>
            <span>${data.duration} month${data.duration > 1 ? 's' : ''}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #222;padding-top:12px;margin-top:4px">
            <span style="color:#666">Total</span>
            <span style="font-weight:700;color:#D4AF37">${data.currency} ${data.total}</span>
          </div>
        </div>
        <p style="color:#999;font-size:14px;margin-bottom:8px">Complete your payment and send the UTR/screenshot to our WhatsApp:</p>
        <a href="https://wa.me/918111956481" style="display:inline-block;background:#D4AF37;color:#000;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px">WhatsApp Us →</a>
        <p style="color:#555;font-size:12px;margin-top:32px">Credentials delivered within 5 minutes of payment confirmation.</p>
      </div>
    `,
  })
}

// ── Credentials delivery to customer ────────────────────
export async function sendCredentials(data: {
  to:          string
  name:        string
  product:     string
  credentials: string
}) {
  await resend.emails.send({
    from:    FROM,
    to:      data.to,
    subject: `Your ${data.product} credentials are ready — PRIMEKEYS`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#000;color:#f0f0f0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;border:1px solid rgba(212,175,55,0.2)">
        <div style="margin-bottom:32px">
          <span style="font-size:22px;font-weight:700;color:#D4AF37">PRIME</span><span style="font-size:22px;font-weight:700;color:#fff">KEYS</span>
        </div>
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Your subscription is ready 🎉</h2>
        <p style="color:#999;margin-bottom:32px">Hi ${data.name}, here are your ${data.product} credentials.</p>
        <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #D4AF37;white-space:pre-wrap;font-family:monospace;font-size:14px;color:#D4AF37">
${data.credentials}
        </div>
        <p style="color:#999;font-size:14px">Need help setting it up? WhatsApp us anytime.</p>
        <a href="https://wa.me/918111956481" style="display:inline-block;background:#D4AF37;color:#000;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px;margin-top:16px">WhatsApp Support →</a>
        <p style="color:#555;font-size:12px;margin-top:32px">Thank you for choosing PRIMEKEYS — Seraph Group of Companies</p>
      </div>
    `,
  })
}

// ── New order alert to Aaron ─────────────────────────────
export async function sendNewOrderAlert(data: {
  orderId:  string
  name:     string
  email:    string
  phone:    string
  product:  string
  duration: number
  total:    number
  currency: string
}) {
  await resend.emails.send({
    from:    FROM,
    to:      'aaronjthomas.cj@gmail.com',
    subject: `🔔 New Order — ${data.product} — ${data.currency} ${data.total}`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#000;color:#f0f0f0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;border:1px solid rgba(212,175,55,0.2)">
        <h2 style="color:#D4AF37;margin-bottom:24px">New Order Received</h2>
        <div style="background:#111;border-radius:12px;padding:20px;border:1px solid #222">
          <div style="margin-bottom:10px"><span style="color:#666">Order ID: </span><span style="font-family:monospace;color:#D4AF37">#${data.orderId.slice(-8).toUpperCase()}</span></div>
          <div style="margin-bottom:10px"><span style="color:#666">Name: </span><span>${data.name}</span></div>
          <div style="margin-bottom:10px"><span style="color:#666">Email: </span><span>${data.email}</span></div>
          <div style="margin-bottom:10px"><span style="color:#666">Phone: </span><span>${data.phone}</span></div>
          <div style="margin-bottom:10px"><span style="color:#666">Product: </span><span>${data.product}</span></div>
          <div style="margin-bottom:10px"><span style="color:#666">Duration: </span><span>${data.duration} month${data.duration > 1 ? 's' : ''}</span></div>
          <div style="border-top:1px solid #222;padding-top:10px;margin-top:4px"><span style="color:#666">Total: </span><span style="font-weight:700;color:#D4AF37">${data.currency} ${data.total}</span></div>
        </div>
        <a href="https://wa.me/${data.phone.replace(/\D/g, '')}" style="display:inline-block;background:#D4AF37;color:#000;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px;margin-top:24px">WhatsApp Customer →</a>
      </div>
    `,
  })
}