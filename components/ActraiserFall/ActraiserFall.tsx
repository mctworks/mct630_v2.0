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

  // Effect to handle initial page load animation with improved timing
  useEffect(() => {
    const pageWrap = document.getElementById('page-wrap')
    if (pageWrap) {
      // Force initial state
      pageWrap.style.opacity = '0'
      pageWrap.classList.remove('fade-in')
      
      // Add a small delay to ensure the opacity is applied
      setTimeout(() => {
        pageWrap.style.removeProperty('opacity')
        pageWrap.classList.add('fade-in')
      }, 50)
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

    // If pageWrap exists, calculate click position relative to its bounding rect
    let xPercent = 50
    let yPercent = 50
    try {
      if (pageWrap) {
        const rect = pageWrap.getBoundingClientRect()
        const px = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        const py = Math.max(0, Math.min(e.clientY - rect.top, rect.height))
        xPercent = (px / rect.width) * 100
        yPercent = (py / rect.height) * 100
      } else {
        // Fallback to viewport percentages
        xPercent = (e.clientX / window.innerWidth) * 100
        yPercent = (e.clientY / window.innerHeight) * 100
      }
    } catch (err) {
      // Keep sensible defaults if anything goes wrong
      xPercent = 50
      yPercent = 50
    }

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

  // Enhanced effect to handle fade-in after navigation
  useEffect(() => {
    if (sessionStorage.getItem('needsFadeIn') === 'true') {
      const pageWrap = document.getElementById('page-wrap')
      if (pageWrap) {
        // Reset initial state
        pageWrap.style.opacity = '0'
        pageWrap.classList.remove('fade-in')
        
        // Trigger fade-in with a small delay
        setTimeout(() => {
          pageWrap.style.removeProperty('opacity')
          pageWrap.classList.add('fade-in')
          sessionStorage.removeItem('needsFadeIn')
        }, 50)
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