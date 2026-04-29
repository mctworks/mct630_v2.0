import createWithMakeswift from '@makeswift/runtime/next/plugin'

const withMakeswift = createWithMakeswift()

/** @type {import('next').NextConfig} */
const nextConfig = {
 // fileTracingRoot: __dirname,
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

export default withMakeswift(nextConfig)