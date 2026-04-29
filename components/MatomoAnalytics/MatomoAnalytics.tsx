'use client'

import { trackAppRouter } from '@socialgouv/matomo-next'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

export function MatomoAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!MATOMO_SITE_ID) return

    console.log('Matomo Site ID:', MATOMO_SITE_ID)

    trackAppRouter({
      siteId: MATOMO_SITE_ID,
      url: 'https://mct630.com/stats',
      jsTrackerFile: 'tracker.js',
      phpTrackerFile: 'collect',
      pathname,
      searchParams,
      debug: true,
   })
  }, [pathname, searchParams])

  return null
}