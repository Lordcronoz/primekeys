import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em', marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Last updated: March 2026</p>
          <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)', marginTop: 24 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <Section title="1. Who We Are">
            PRIMEKEYS is a digital subscription reselling service operated under Seraph Group of Companies, based in India. We sell access to premium digital platforms including Netflix, Spotify, YouTube Premium, ChatGPT Plus, and others at discounted prices. You can reach us at <a href="https://wa.me/918111956481" style={{ color: '#D4AF37' }}>+91 8111956481</a> or <a href="mailto:admin@primekeys.app" style={{ color: '#D4AF37' }}>admin@primekeys.app</a>.
          </Section>

          <Section title="2. Information We Collect">
            When you place an order or create an account with us, we collect the following information: your full name, email address, WhatsApp number, and payment reference details such as UPI transaction IDs. We do not collect or store your payment card details — all payments are processed directly via UPI or Wise. We also collect basic usage data such as pages visited and browser type to improve our service.
          </Section>

          <Section title="3. How We Use Your Information">
            We use your information solely to process and deliver your order, send you your subscription credentials via WhatsApp, communicate important updates about your subscription such as renewal reminders, respond to your support requests, and improve our website and services. We do not use your data for advertising purposes and we do not sell your data to third parties under any circumstances.
          </Section>

          <Section title="4. How We Store Your Data">
            Your data is stored securely using Google Firebase, a cloud platform compliant with industry security standards. Your order history and account details are retained for as long as your account remains active or as required to resolve disputes. You may request deletion of your data at any time by contacting us on WhatsApp or email.
          </Section>

          <Section title="5. WhatsApp Communication">
            By placing an order, you consent to receiving your subscription credentials and order updates via WhatsApp. We will only message you for order-related purposes. We will not add you to broadcast lists or send promotional messages without your explicit consent.
          </Section>

          <Section title="6. Cookies">
            Our website uses minimal cookies to maintain your session and remember your currency preference. We do not use third-party advertising cookies. You can disable cookies in your browser settings, though some features of the site may not function correctly as a result.
          </Section>

          <Section title="7. Third-Party Services">
            We use the following third-party services to operate our platform: Google Firebase for authentication and data storage, Resend for transactional emails, and Wise for international payment processing. Each of these services has their own privacy policies which govern how they handle data.
          </Section>

          <Section title="8. Your Rights">
            You have the right to access the personal data we hold about you, request correction of inaccurate data, request deletion of your data, and withdraw consent for communications at any time. To exercise any of these rights, contact us via WhatsApp at +91 8111956481 or email us at admin@primekeys.app.
          </Section>

          <Section title="9. Children's Privacy">
            Our services are not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. Continued use of our service after changes constitutes acceptance of the updated policy.
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