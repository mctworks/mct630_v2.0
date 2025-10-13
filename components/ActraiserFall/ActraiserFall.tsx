'use client'

import { useRouter } from 'next/navigation'
import { ReactNode, useRef, useEffect } from 'react'
import { gsap } from 'gsap'

// This interface defines the props your component will receive from Makeswift.
interface ActraiserFallProps {
  href?: { href: string; target?: '_self' | '_blank' } // Correctly typed and optional
  className?: string
  containerClassName?: string
  children?: ReactNode
  rotationSpeed?: number
  zoomScale?: number
  transitionDuration?: number
  fadeOutDuration?: number
}

export function ActraiserFall({
  href,
  className,
  children,
  rotationSpeed = 360,
  zoomScale = 2,
  transitionDuration = 1,
  fadeOutDuration = 0.5,
  containerClassName,
}: ActraiserFallProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // Effect to handle initial page load animation
  useEffect(() => {
    const pageWrap = document.getElementById('page-wrap')
    if (pageWrap) {
      // Force initial opacity to 0
      pageWrap.style.opacity = '0'
      
      // Small delay to ensure opacity is set before animation
      requestAnimationFrame(() => {
        pageWrap.style.opacity = ''  // Remove inline opacity to let CSS animation take over
      })
    }
  }, [])

  // Enhanced cleanup effect
  useEffect(() => {
    // Reset page-wrap styles when component mounts
    const pageWrap = document.getElementById('page-wrap')
    if (pageWrap) {
      // Clear any existing transition classes and properties
      pageWrap.classList.remove('transitioning')
      pageWrap.style.removeProperty('--scale')
      pageWrap.style.removeProperty('--rotation')
      pageWrap.style.removeProperty('--transition-duration')
      pageWrap.style.removeProperty('transform-origin')

      gsap.set(pageWrap, {
        clearProps: 'all',
      })
    }

    // Add cleanup for page unload
    const cleanup = () => {
      if (pageWrap) {
        pageWrap.classList.remove('transitioning')
        pageWrap.style.removeProperty('--scale')
        pageWrap.style.removeProperty('--rotation')
        pageWrap.style.removeProperty('--transition-duration')
        pageWrap.style.removeProperty('transform-origin')
      }
    }

    window.addEventListener('beforeunload', cleanup)
    return () => {
      window.removeEventListener('beforeunload', cleanup)
      cleanup()
    }
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    if (!href?.href) return
    e.preventDefault()

    const pageWrap = document.getElementById('page-wrap')
    if (!pageWrap) {
      router.push(href.href)
      return
    }

    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate click position as percentages of viewport
    const xPercent = (e.clientX / viewportWidth) * 100
    const yPercent = (e.clientY / viewportHeight) * 100

    // Clear any existing transition state first
    pageWrap.classList.remove('transitioning')
    void pageWrap.offsetWidth // Force reflow

    // Set new animation properties
    pageWrap.style.setProperty('--scale', String(zoomScale))
    pageWrap.style.setProperty('--rotation', `${rotationSpeed}deg`)
    pageWrap.style.setProperty('--transition-duration', `${transitionDuration}s`)
    pageWrap.style.transformOrigin = `${xPercent}% ${yPercent}%`

    // Add transitioning class to trigger animation
    pageWrap.classList.add('transitioning')

    // Wait for animation to complete before navigation
    setTimeout(() => {
      // Store animation state in sessionStorage
      sessionStorage.setItem('needsFadeIn', 'true')
      router.push(href.href)
    }, transitionDuration * 1000)
  }

  // Add effect to handle fade-in after navigation
  useEffect(() => {
    if (sessionStorage.getItem('needsFadeIn') === 'true') {
      const pageWrap = document.getElementById('page-wrap')
      if (pageWrap) {
        // Force initial opacity to 0
        pageWrap.style.opacity = '0'
        
        // Small delay to ensure opacity is set before animation
        requestAnimationFrame(() => {
          pageWrap.style.opacity = ''  // Remove inline opacity to let CSS animation take over
          sessionStorage.removeItem('needsFadeIn')
        })
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ cursor: href?.href ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export default ActraiserFall