"use client"

import { useEffect } from 'react'

/**
 * Global client component that cleans up transition state and applies
 * the .fade-in animation to #page-wrap after navigation.
 */
export default function TransitionHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const cleanupAll = () => {
      try {
        // Remove any transition overlay elements created by LogoSplash or others
        const overlays = document.querySelectorAll('[data-transition-overlay]')
        overlays.forEach(o => o.parentElement?.removeChild(o))

        const pageWrap = document.getElementById('page-wrap')
        const pageInner = document.getElementById('page-wrap-inner')
        if (pageWrap) {
          // Remove transition class and any inline animation/transform styles
          pageWrap.classList.remove('transitioning')
          pageWrap.classList.remove('fade-in')

          pageWrap.style.removeProperty('--scale')
          pageWrap.style.removeProperty('--rotation')
          pageWrap.style.removeProperty('--transition-duration')
          pageWrap.style.removeProperty('transform-origin')
          pageWrap.style.removeProperty('transform')
          pageWrap.style.removeProperty('animation')
          pageWrap.style.removeProperty('transition')
          pageWrap.style.removeProperty('opacity')

          // Unlock scroll if it was disabled by an animation
          try {
            document.documentElement.style.removeProperty('overflow')
            document.body.style.removeProperty('overflow')
          } catch (e) {
            // ignore
          }
        }
        if (pageInner) {
          pageInner.classList.remove('transitioning')
          pageInner.style.removeProperty('--scale')
          pageInner.style.removeProperty('--rotation')
          pageInner.style.removeProperty('--transition-duration')
          pageInner.style.removeProperty('--transform-origin-x')
          pageInner.style.removeProperty('--transform-origin-y')
          pageInner.style.removeProperty('transform-origin')
          pageInner.style.removeProperty('transform')
          pageInner.style.removeProperty('animation')
          pageInner.style.removeProperty('transition')
          pageInner.style.removeProperty('opacity')
        }
      } catch (err) {
        // ignore
      }
    }

    const runFadeIn = () => {
      try {
        const pageWrap = document.getElementById('page-wrap')
        const pageInner = document.getElementById('page-wrap-inner')
        if (!pageWrap) return

        // Ensure any lingering transitioning state is removed before fade-in
        pageWrap.classList.remove('transitioning')
        pageWrap.classList.remove('fade-in')

        // Clear transforms/animations so fade-in behaves predictably
        pageWrap.style.removeProperty('transform')
        if (pageInner) {
          pageInner.classList.remove('transitioning')
          pageInner.style.removeProperty('transform')
          pageInner.style.removeProperty('animation')
          pageInner.style.removeProperty('transition')
        }
        pageWrap.style.removeProperty('animation')
        pageWrap.style.removeProperty('transition')

        // Start fade-in from opacity 0 -> use reflow before adding class
        pageWrap.style.opacity = '0'
        void pageWrap.offsetWidth // force reflow
        pageWrap.classList.add('fade-in')

        // When fade-in finishes, fully clean up inline styles and flags
        const onAnimEnd = () => {
          try {
            pageWrap.classList.remove('fade-in')
            pageWrap.style.removeProperty('opacity')
            cleanupAll()
            sessionStorage.removeItem('needsFadeIn')
          } catch (e) {
            // ignore
          } finally {
            pageWrap.removeEventListener('animationend', onAnimEnd)
          }
        }
        pageWrap.addEventListener('animationend', onAnimEnd)
      } catch (err) {
        // ignore
      }
    }

    const run = () => {
      cleanupAll()

      try {
        if (sessionStorage.getItem('needsFadeIn') === 'true') {
          runFadeIn()
        }
      } catch (err) {
        // ignore
      }
    }

    // Run immediately on mount and also on navigation events
    run()
    window.addEventListener('pageshow', run)
    window.addEventListener('popstate', run)

    return () => {
      window.removeEventListener('pageshow', run)
      window.removeEventListener('popstate', run)
      cleanupAll()
    }
  }, [])

  return null
}
