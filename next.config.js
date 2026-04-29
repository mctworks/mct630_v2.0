import createWithMakeswift from '@makeswift/runtime/next/plugin'

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
  async rewrites() {
  return [
    {
      source: '/stats/tracker.js',
      destination: 'https://analytics.mct630.com/matomo.js',
    },
    {
      source: '/stats/collect',
      destination: 'https://analytics.mct630.com/matomo.php',
    },
  ]
},
}

export default withMakeswift(nextConfig)