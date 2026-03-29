import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        PK
      </div>
    ),
    { ...size }
  )
}
