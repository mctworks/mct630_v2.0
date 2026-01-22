import { MakeswiftApiHandler } from '@makeswift/runtime/next/server'
import { strict } from 'assert'

import '@/lib/makeswift/components'
import { runtime } from '@/lib/makeswift/runtime'

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required')

const handler = MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  getFonts() {
  return [
    {
      family: 'Poppins',
      label: 'Poppins',
      variants: [
        { weight: '100', style: 'normal' },
        { weight: '100', style: 'italic' },
        { weight: '200', style: 'normal' },
        { weight: '200', style: 'italic' },
        { weight: '300', style: 'normal' },
        { weight: '300', style: 'italic' },
        { weight: '400', style: 'normal' },
        { weight: '400', style: 'italic' },
        { weight: '500', style: 'normal' },
        { weight: '500', style: 'italic' },
        { weight: '600', style: 'normal' },
        { weight: '600', style: 'italic' },
        { weight: '700', style: 'normal' },
        { weight: '800', style: 'normal' },
      ],
    },
    {
      family: 'var(--font-family-zt-gatha)',  // Must match @font-face exactly
      label: 'ztGatha',
      variants: [
        { 
          weight: '600', 
          style: 'normal', 
          src: '/fonts/zt-gatha/ZTGatha-SemiBold.ttf' 
        },
      ],
    },
  ]
},
})

export { handler as GET, handler as POST }
