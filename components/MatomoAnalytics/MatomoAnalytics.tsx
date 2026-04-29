'use client'

import { trackAppRouter } from '@socialgouv/matomo-next'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

export function MatomoAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('Matomo URL:', MATOMO_URL)
    console.log('Matomo Site ID:', MATOMO_SITE_ID)

    if (!MATOMO_URL || !MATOMO_SITE_ID) return

    trackAppRouter({
      url: MATOMO_URL,
      siteId: MATOMO_SITE_ID,
      pathname,
      searchParams,
      debug: true,
    })
  }, [pathname, searchParams])

  return null
}