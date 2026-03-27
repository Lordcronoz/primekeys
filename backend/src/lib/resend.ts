import dotenv from 'dotenv'
dotenv.config()

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'PRIMEKEYS <noreply@primekeys.in>'

// ── Helpers ───────────────────────────────────────────────
function invoiceDate(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function invoiceNumber(orderId: string): string {
  return `INV-${orderId.slice(-8).toUpperCase()}`
}

// ── Invoice / Order confirmation to customer ─────────────
export async function sendOrderConfirmation(data: {
  to:            string
  name:          string
  orderId:       string
  product:       string
  duration:      number
  total:         number
  currency:      string
  paymentMethod?: string   // 'paypal' | 'upi' | 'wise' | undefined
  paypalOrderId?: string
}) {
  const isINR    = data.currency === 'INR'
  const isPayPal = data.paymentMethod === 'paypal'

  const paymentSection = isPayPal
    ? `
      <div style="background:#0a0a0a;border:1px solid rgba(38,194,129,0.25);border-radius:12px;padding:20px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(38,194,129,0.12);display:flex;align-items:center;justify-content:center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#26C281" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style="font-size:13px;font-weight:700;color:#26C281;margin:0">Payment Received via PayPal</p>
        </div>
        <p style="font-size:13px;color:#aaa;margin:0 0 6px">Amount: <strong style="color:#D4AF37">${data.currency} ${data.total}</strong></p>
        ${data.paypalOrderId ? `<p style="font-size:11px;color:#555;margin:0">PayPal Order ID: <span style="font-family:monospace;color:#888">${data.paypalOrderId}</span></p>` : ''}
      </div>
      <p style="font-size:12px;color:#555;margin:0 0 20px">Your credentials will be delivered to your WhatsApp within 5 minutes. If you face any issues, contact us below.</p>
      <a href="https://wa.me/918111956481" style="display:inline-block;background:#25D366;color:#000;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;font-size:14px;margin-bottom:8px">WhatsApp Support</a>
    `
    : isINR
    ? `
      <div style="background:#0a0a0a;border:1px solid rgba(212,175,55,0.25);border-radius:12px;padding:20px;margin-bottom:20px">
        <p style="font-size:13px;font-weight:700;color:#D4AF37;margin:0 0 12px">Pay via UPI</p>
        <p style="font-size:13px;color:#aaa;margin:0 0 6px">UPI ID: <strong style="color:#fff;font-family:monospace">paytm.slfsmng@pty</strong></p>
        <p style="font-size:13px;color:#aaa;margin:0 0 14px">Amount: <strong style="color:#D4AF37">₹${data.total}</strong></p>
        <p style="font-size:12px;color:#666;margin:0">After paying, send your UTR / payment screenshot to our WhatsApp for instant verification.</p>
      </div>
      <a href="https://wa.me/918111956481" style="display:inline-block;background:#25D366;color:#000;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;font-size:14px;margin-bottom:8px">Send UTR on WhatsApp</a>
    `
    : `
      <div style="background:#0a0a0a;border:1px solid rgba(212,175,55,0.25);border-radius:12px;padding:20px;margin-bottom:20px">
        <p style="font-size:13px;font-weight:700;color:#D4AF37;margin:0 0 12px">Pay via Wise (International)</p>
        <p style="font-size:13px;color:#aaa;margin:0 0 6px">Amount: <strong style="color:#D4AF37">${data.currency} ${data.total}</strong></p>
        <p style="font-size:12px;color:#666;margin:0 0 14px">Click the button below to open our Wise payment page and complete the transfer.</p>
        <a href="https://wise.com/pay/business/aaronjoythomas?utm_source=invoice" style="display:inline-block;background:#D4AF37;color:#000;font-weight:700;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:13px">Pay on Wise</a>
      </div>
      <p style="font-size:12px;color:#555;margin:0 0 20px">After paying, send a screenshot to our WhatsApp for faster processing.</p>
      <a href="https://wa.me/918111956481" style="display:inline-block;background:#25D366;color:#000;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;font-size:14px;margin-bottom:8px">WhatsApp Confirmation</a>
    `

  await resend.emails.send({
    from:    FROM,
    to:      data.to,
    subject: `Invoice #${invoiceNumber(data.orderId)} — ${data.product} | PRIMEKEYS`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#050505;color:#f0f0f0;padding:0;max-width:560px;margin:0 auto">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0d0d0d,#111);padding:32px 40px 28px;border-bottom:1px solid rgba(212,175,55,0.2)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <span style="font-size:24px;font-weight:800;color:#D4AF37;letter-spacing:-0.02em">PRIME</span><span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.02em">KEYS</span>
              <p style="font-size:11px;color:#555;margin:4px 0 0;letter-spacing:0.08em;text-transform:uppercase">Premium Subscriptions</p>
            </div>
            <div style="text-align:right">
              <p style="font-size:13px;font-weight:700;color:#D4AF37;margin:0">${invoiceNumber(data.orderId)}</p>
              <p style="font-size:11px;color:#555;margin:3px 0 0">INVOICE</p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:32px 40px">

          <!-- Bill to / dates -->
          <div style="display:flex;justify-content:space-between;margin-bottom:28px">
            <div>
              <p style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#555;margin:0 0 6px">Bill To</p>
              <p style="font-size:14px;font-weight:600;color:#f5f5f7;margin:0">${data.name}</p>
              <p style="font-size:12px;color:#666;margin:3px 0 0">${data.to}</p>
            </div>
            <div style="text-align:right">
              <p style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#555;margin:0 0 6px">Date</p>
              <p style="font-size:13px;color:#a1a1a6;margin:0">${invoiceDate()}</p>
              <p style="font-size:10px;color:#555;margin:3px 0 0">Due on receipt</p>
            </div>
          </div>

          <!-- Line items table -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
                <th style="text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#555;padding-bottom:10px;font-weight:600">Description</th>
                <th style="text-align:center;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#555;padding-bottom:10px;font-weight:600">Duration</th>
                <th style="text-align:right;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#555;padding-bottom:10px;font-weight:600">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:14px 0 14px;border-bottom:1px solid rgba(255,255,255,0.04)">
                  <p style="font-size:14px;font-weight:600;color:#f5f5f7;margin:0">${data.product}</p>
                  <p style="font-size:11px;color:#666;margin:3px 0 0">Shared Premium Subscription</p>
                </td>
                <td style="padding:14px 0;text-align:center;border-bottom:1px solid rgba(255,255,255,0.04)">
                  <span style="font-size:13px;color:#a1a1a6">${data.duration} month${data.duration > 1 ? 's' : ''}</span>
                </td>
                <td style="padding:14px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04)">
                  <span style="font-size:14px;font-weight:700;color:#f5f5f7">${data.currency} ${data.total}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0" colspan="2">
                  <span style="font-size:12px;color:#666">Delivery (Digital)</span>
                </td>
                <td style="padding:8px 0;text-align:right">
                  <span style="font-size:12px;color:#2dcc6e;font-weight:600">Free</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Total box -->
          <div style="background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:16px 20px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:14px;color:#a1a1a6;font-weight:600">Total Due</span>
            <span style="font-size:22px;font-weight:800;color:#D4AF37;letter-spacing:-0.02em">${data.currency} ${data.total}</span>
          </div>

          <!-- Payment instructions -->
          <p style="font-size:12px;font-weight:700;color:#555;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 14px">Payment Instructions</p>
          ${paymentSection}

          <!-- Footer note -->
          <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:20px;margin-top:28px">
            <p style="font-size:11px;color:#444;margin:0 0 4px">Credentials are delivered within 5 minutes of payment confirmation.</p>
            <p style="font-size:11px;color:#444;margin:0">Need help? WhatsApp <a href="https://wa.me/918111956481" style="color:#D4AF37;text-decoration:none">+91 81119 56481</a></p>
          </div>
        </div>

        <!-- Footer bar -->
        <div style="background:#0d0d0d;padding:16px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center">
          <p style="font-size:10px;color:#444;margin:0">PRIMEKEYS — Seraph Group of Companies · primekeys.in</p>
        </div>
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
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Your subscription is ready</h2>
        <p style="color:#999;margin-bottom:32px">Hi ${data.name}, here are your ${data.product} credentials.</p>
        <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #D4AF37;white-space:pre-wrap;font-family:monospace;font-size:14px;color:#D4AF37">
${data.credentials}
        </div>
        <p style="color:#999;font-size:14px">Need help setting it up? WhatsApp us anytime.</p>
        <a href="https://wa.me/918111956481" style="display:inline-block;background:#D4AF37;color:#000;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px;margin-top:16px">WhatsApp Support</a>
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
    subject: `New Order — ${data.product} — ${data.currency} ${data.total}`,
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
        <a href="https://wa.me/${data.phone.replace(/\D/g, '')}" style="display:inline-block;background:#D4AF37;color:#000;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px;margin-top:24px">WhatsApp Customer</a>
      </div>
    `,
  })
}

