"use client"

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Global transition handler
 * - Scrolls to top on client-side navigation
 * - Consumes `sessionStorage.needsFadeIn` flag set by `TransitionLink`
 */
export default function TransitionHandler() {
  const pathname = usePathname()

  useEffect(() => {
    // Prefer manual scroll restoration to avoid browser restoring to unexpected
    // positions when navigating between client-side routes. Restore on cleanup.
    let previousScrollRestoration: ScrollRestoration | undefined
    try {
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        // @ts-ignore - TS lib types include ScrollRestoration but be safe
        previousScrollRestoration = window.history.scrollRestoration
        window.history.scrollRestoration = 'manual'
      }
    } catch (err) {
      // ignore
    }

    try {
      // Always ensure we land at the top of the page on navigation
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0 })
      }

      // If a transition requested a fade-in, apply it and remove the flag
      const pageWrap = document.getElementById('page-wrap')
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('needsFadeIn') === 'true') {
        sessionStorage.removeItem('needsFadeIn')
        if (pageWrap) {
          // Re-trigger fade-in class reliably
          pageWrap.classList.remove('fade-in')
          // force reflow
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          void pageWrap.offsetWidth
          pageWrap.classList.add('fade-in')
        }
      }
    } catch (err) {
      // don't block navigation for minor failures
      // eslint-disable-next-line no-console
      console.warn('TransitionHandler error:', err)
    }
    return () => {
      try {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history && previousScrollRestoration) {
          // @ts-ignore
          window.history.scrollRestoration = previousScrollRestoration
        }
      } catch (err) {
        // ignore
      }
    }
  }, [pathname])

  return null
}
