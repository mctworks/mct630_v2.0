// components/MatomoAnalytics/MatomoAnalytics.tsx
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
    if (!MATOMO_URL || !MATOMO_SITE_ID) {
      return
    }

    useEffect(() => {
  console.log('Matomo URL:', MATOMO_URL)
  console.log('Matomo Site ID:', MATOMO_SITE_ID)
  trackAppRouter({
    url: MATOMO_URL,
    siteId: MATOMO_SITE_ID,
    pathname,
    searchParams,
  })
}, [pathname, searchParams])

    trackAppRouter({
      url: MATOMO_URL,
      siteId: MATOMO_SITE_ID,
      pathname,
      searchParams,
    })
  }, [pathname, searchParams])

  return null
}