import Link from 'next/link'

export default function ShippingPolicy() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em', marginBottom: 12 }}>Shipping Policy</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Last updated: March 2026</p>
          <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)', marginTop: 24 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <Section title="Digital Delivery — No Physical Shipping">
            PRIMEKEYS sells digital subscription access only. There are no physical products, no parcels, and no postal or courier services involved. All orders are delivered electronically via WhatsApp as login credentials or profile access links.
          </Section>

          <Section title="Delivery Method">
            Once your payment is confirmed, your subscription credentials are sent directly to the WhatsApp number you provided during checkout. Ensure your WhatsApp number is correct at the time of ordering. We are not responsible for non-delivery caused by an incorrect number being provided.
          </Section>

          <Section title="Delivery Timeframe">
            We aim to deliver all orders within 5 minutes of payment confirmation. In exceptional cases — such as high order volume or account availability constraints — delivery may take up to 24 hours. If your order has not been delivered within 24 hours, you are entitled to a full refund.
          </Section>

          <Section title="Order Confirmation">
            After placing your order, you will receive a confirmation message on WhatsApp acknowledging receipt of your payment. Please keep this message as your proof of purchase. Your credentials will follow in a separate message once they have been prepared.
          </Section>

          <Section title="Failed Delivery">
            If you have not received your credentials within the stated timeframe, please contact us immediately on WhatsApp at +91 8111956481. Do not share your WhatsApp number publicly or with unknown parties, as this may compromise delivery security.
          </Section>

          <Section title="International Orders">
            We accept international orders from all countries. International customers pay via PayPal. Delivery is via WhatsApp and is not affected by geography — credentials are sent digitally regardless of your location.
          </Section>

          <Section title="Contact Us">
            For any questions about your order status or delivery, contact us on WhatsApp at +91 8111956481 or email us at{' '}
            <a href="mailto:admin@primekeys.app" style={{ color: '#D4AF37' }}>admin@primekeys.app</a>.
            We are available 7 days a week from 10am to 10pm IST.
          </Section>

        </div>

        <BackToHome />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 12, letterSpacing: '-0.01em' }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>{children}</p>
    </div>
  )
}

function BackToHome() {
  return (
    <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <Link href="/" style={{ fontSize: 13, color: '#D4AF37', textDecoration: 'none' }}>← Back to Home</Link>
    </div>
  )
}
