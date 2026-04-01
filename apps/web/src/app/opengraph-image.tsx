import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PRIMEKEYS — Premium Subscriptions at 80% Off'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #111111 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '20%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,60,220,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Gold top border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '0',
            right: '0',
            height: '3px',
            background: 'linear-gradient(to right, transparent, #D4AF37, transparent)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '980px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#D4AF37',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#D4AF37',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            S&M Holdings
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 800,
            color: '#f5f5f7',
            letterSpacing: '-0.045em',
            lineHeight: 1,
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          PRIMEKEYS
        </div>
        <div
          style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#D4AF37',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          Premium Subscriptions at 80% Off
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '20px',
            color: '#7a7a80',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.5,
            marginBottom: '48px',
          }}
        >
          Netflix · Spotify · ChatGPT Plus · Disney+ · YouTube Premium
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {[
            { value: '10K+', label: 'Happy Customers' },
            { value: '80%', label: 'Savings vs Retail' },
            { value: '<5 min', label: 'WhatsApp Delivery' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#f5f5f7',
                  letterSpacing: '-0.03em',
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: '13px', color: '#6e6e73', fontWeight: 500 }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px', color: '#3a3a3e', letterSpacing: '0.06em' }}>
            primekeys.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
