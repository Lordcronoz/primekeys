import Link from 'next/link'

export default function RefundPolicy() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em', marginBottom: 12 }}>Refund Policy</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Last updated: March 2026</p>
          <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)', marginTop: 24 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <Section title="Our Commitment">
            At PRIMEKEYS, we stand behind every order. If something goes wrong on our end, we will make it right — either by fixing the issue, replacing your subscription, or issuing a full refund. This policy explains exactly when and how refunds apply.
          </Section>

          <Section title="When You Are Eligible for a Full Refund">
            You are entitled to a full refund in the following situations: your credentials were never delivered within 24 hours of payment confirmation, the credentials delivered do not work and we are unable to provide a replacement within 24 hours, the subscription platform has blocked or removed the account and we cannot restore access, or you were charged incorrectly or more than the agreed amount.
          </Section>

          <Section title="When You Are Eligible for a Partial Refund">
            If your subscription stops working before the end of your paid period and we are unable to restore it, you will receive a pro-rated refund for the remaining days of your subscription. For example, if you paid for 3 months and service stops after 1 month with no resolution, you will be refunded the equivalent of 2 months.
          </Section>

          <Section title="When Refunds Do Not Apply">
            Refunds will not be issued in the following cases: you changed the account password or email after receiving credentials, you shared the credentials with others in violation of our terms, you no longer want the subscription after credentials have been delivered and verified working, you purchased the wrong product and credentials have already been delivered, or the issue was caused by your own device or internet connection.
          </Section>

          <Section title="How to Request a Refund">
            To request a refund, contact us on WhatsApp at <a href="tel:+918111956481" style={{ color: '#D4AF37' }}>+91 81119 56481</a> with your order ID and a brief description of the issue. We aim to respond to all refund requests within 2 hours during business hours (10 AM–10 PM IST). Approved refunds are processed within 3–5 business days back to your original payment method.
          </Section>

          <Section title="Replacement First Policy">
            Before issuing a refund, we will always first attempt to resolve the issue by providing a replacement account or restoring your access. Refunds are issued only when a satisfactory replacement cannot be provided within 24 hours.
          </Section>

          <Section title="Contact Us">
            If you have any questions about our refund policy or want to initiate a refund request, reach us on WhatsApp at <a href="tel:+918111956481" style={{ color: '#D4AF37' }}>+91 81119 56481</a> or email us at <a href="mailto:admin@primekeys.app" style={{ color: '#D4AF37' }}>admin@primekeys.app</a>. We are available 7 days a week from 10 AM to 10 PM IST.
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