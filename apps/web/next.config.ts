import type { NextConfig } from 'next'

const config: NextConfig = {
  devIndicators: false,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
    ],
  },
}

export default config
