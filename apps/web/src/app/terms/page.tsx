import Link from 'next/link'

export default function TermsOfUse() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#D4AF37', letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em', marginBottom: 12 }}>Terms of Use</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Last updated: March 2026</p>
          <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)', marginTop: 24 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <Section title="1. Acceptance of Terms">
            By accessing or using the PRIMEKEYS website and placing an order, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our service. These terms apply to all users of the site including browsers, customers, and any other users.
          </Section>

          <Section title="2. Nature of Service">
            PRIMEKEYS resells access to digital subscription platforms at discounted prices. We operate by purchasing and reselling shared or family plan slots on platforms such as Netflix, Spotify, YouTube Premium, ChatGPT Plus, Disney+ Hotstar, Canva Pro, Amazon Prime, LinkedIn Premium, and Apple TV+. We are not affiliated with, endorsed by, or officially partnered with any of these platforms.
          </Section>

          <Section title="3. Account Usage">
            Credentials delivered to you are for your personal use only. You agree not to share, resell, or redistribute the credentials provided to you. You agree not to change the account password, email, or any account settings. Violation of these terms will result in immediate termination of your subscription without a refund.
          </Section>

          <Section title="4. Delivery">
            We aim to deliver your subscription credentials via WhatsApp within 5 minutes of payment confirmation. In rare cases, delivery may take up to 24 hours due to account availability. If delivery takes longer than 24 hours, you are entitled to a full refund.
          </Section>

          <Section title="5. Payments">
            All payments are final at the time of order placement. We accept UPI payments for customers in India and Wise transfers for international customers. By completing a payment, you confirm that you are authorised to use the payment method provided.
          </Section>

          <Section title="6. Service Interruptions">
            Subscription platforms may occasionally update their systems, change their terms, or restrict shared access. In such cases, we will make every reasonable effort to restore your access or provide a replacement. If we are unable to restore service, a pro-rated refund will be issued for the remaining subscription period.
          </Section>

          <Section title="7. Prohibited Use">
            You agree not to use our service for any unlawful purpose, to attempt to gain unauthorised access to any part of our systems, to engage in any conduct that restricts or inhibits anyone's use or enjoyment of the service, or to use automated tools to access or scrape our website.
          </Section>

          <Section title="8. Intellectual Property">
            All content on the PRIMEKEYS website including text, graphics, logos, and design is the property of Seraph Group of Companies and may not be reproduced, distributed, or used without express written permission.
          </Section>

          <Section title="9. Limitation of Liability">
            PRIMEKEYS and Seraph Group of Companies shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service. Our maximum liability in any case shall not exceed the amount paid by you for the relevant order.
          </Section>

          <Section title="10. Modifications">
            We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service after changes constitutes acceptance of the updated terms.
          </Section>

          <Section title="11. Governing Law">
            These terms are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of India.
          </Section>

          <Section title="12. Contact">
            For any questions about these Terms of Use, contact us via WhatsApp at +91 8111956481 or email aaronjthomas.cj@gmail.com.
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