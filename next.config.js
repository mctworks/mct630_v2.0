import createWithMakeswift from '@makeswift/runtime/next/plugin'
import { withMatomoProxy } from '@socialgouv/matomo-next'

const withMakeswift = createWithMakeswift()

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: `/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/**`,
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withMatomoProxy({
  matomoUrl: 'https://analytics.mct630.com',
})(withMakeswift(nextConfig))