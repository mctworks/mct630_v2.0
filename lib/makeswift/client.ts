import { Makeswift } from '@makeswift/runtime/next'
import { strict } from 'assert'

import { runtime } from './runtime'

//console.log('API Key:', process.env.MAKESWIFT_SITE_API_KEY)
strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required')

export const client = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
})
