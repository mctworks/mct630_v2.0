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

    trackAppRouter({
      siteId: MATOMO_SITE_ID,
      url: 'https://mct630.com',
      jsTrackerFile: 'mct-x7k2q9.js',
      phpTrackerFile: 'mct-x7k2q9',
      pathname,
      searchParams,
    })
  }, [pathname, searchParams])

  return null
}