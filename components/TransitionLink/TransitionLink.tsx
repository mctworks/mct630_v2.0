'use client'

import { useRouter } from 'next/navigation'
import { ReactNode, useRef, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'

interface TransitionLinkProps {
  href?: { href: string; target?: '_self' | '_blank' }
  className?: string
  containerClassName?: string
  children?: ReactNode
  animationType?: 'ActraiserDrop' | 'LogoSplash' | string
  transitionDuration?: number
  rotationSpeed?: number
  zoomScale?: number
  splashImage?: string | { url: string; dimensions: { width: number; height: number } } | undefined
  gradientStart?: string
  gradientEnd?: string
  splashScale?: number
  animatedPathId?: string
  strokeWidth?: number
}

export function TransitionLink({
  href,
  children,
  rotationSpeed = 360,
  zoomScale = 2,
  transitionDuration = 1,
  containerClassName,
  animationType = 'ActraiserDrop',
  splashImage,
  gradientStart = '#00ffff',
  gradientEnd = '#ffd700',
  splashScale = 3,
  animatedPathId = 'all',
  strokeWidth = 3,
}: TransitionLinkProps) {
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

  const handleActraiserDrop = useCallback((e: React.MouseEvent) => {
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
  }, [zoomScale, rotationSpeed, transitionDuration, href, router])

  const handleLogoSplash = useCallback((e: React.MouseEvent) => {
    try {
      e.preventDefault()
      const container = containerRef.current
      if (!container) throw new Error('Container not found')

      const isInEditor = typeof window !== 'undefined' && window.location.search.includes('makeswift=1')
      
      if (isInEditor) {
        if (href?.href && href.target !== '_blank') {
          router.push(href.href)
        }
        return
      }

      // Dynamically import GSAP
      import('gsap').then(({ gsap }) => {
        performLogoSplashAnimation(gsap, container)
      }).catch(error => {
        console.error('Failed to load GSAP:', error)
        if (href?.href) router.push(href.href)
      })
    } catch (error) {
      console.error('LogoSplash setup failed:', error)
      if (href?.href) router.push(href.href)
    }
  }, [href, router])

  const performLogoSplashAnimation = useCallback((gsap: any, container: HTMLDivElement) => {
    try {
      
      const svg = container.querySelector<SVGElement>('#logo') || container.querySelector<SVGElement>('svg')
      
      if (!svg) {
        throw new Error('SVG not found for LogoSplash animation')
      }

      // Create full-screen overlay with dark blur background
      const overlay = document.createElement('div')
      overlay.style.position = 'fixed'
      overlay.style.top = '0'
      overlay.style.left = '0'
      overlay.style.width = '100vw'
      overlay.style.height = '100vh'
      overlay.style.display = 'flex'
      overlay.style.justifyContent = 'center'
      overlay.style.alignItems = 'center'
      overlay.style.zIndex = '9999'
      overlay.style.pointerEvents = 'none'
      overlay.style.background = 'rgba(0, 0, 0, 0.7)'
      overlay.style.backdropFilter = 'blur(8px)'
      
      // Clone SVG and make it larger for the overlay
      const clonedSvg = svg.cloneNode(true) as SVGElement
      clonedSvg.style.width = 'min(60vw, 300px)'
      clonedSvg.style.height = 'min(60vh, 300px)'
      
      overlay.appendChild(clonedSvg)
      document.body.appendChild(overlay)

      const tl = gsap.timeline({ 
        defaults: { ease: 'power2.inOut' } 
      })

      // Parse animated paths like EnhancedSVG
      const normalizedAnimatePaths = !animatedPathId || animatedPathId === 'all' 
        ? ['all'] 
        : String(animatedPathId).split(',').map(p => p.trim()).filter(Boolean)

      // Find ONLY the specified paths for line animation
      let pathsToAnimate: SVGPathElement[] = []
      if (normalizedAnimatePaths.includes('all')) {
        pathsToAnimate = Array.from(clonedSvg.querySelectorAll('path'))
      } else if (normalizedAnimatePaths.length > 0) {
        const selected: SVGPathElement[] = []
        normalizedAnimatePaths.forEach(id => {
          const cleanId = id.replace(/^#/, '').trim()
          if (!cleanId) return
          
          // Level 1: Exact match
          try {
            const exact = clonedSvg.querySelector(`#${CSS.escape(cleanId)}`)
            if (exact && exact instanceof SVGPathElement) {
              selected.push(exact)
              return
            }
          } catch (err) {
            // ignore
          }
          
          // Level 2: Ends-with match for IDs like foo-path-abc
          const ends = Array.from(clonedSvg.querySelectorAll('[id]')).filter(el => 
            el.id.endsWith(`-${cleanId}`) || el.id.endsWith(`_${cleanId}`) || el.id === cleanId
          ) as SVGPathElement[]
          if (ends.length > 0) {
            ends.forEach(el => selected.push(el))
            return
          }
          
          // Level 3: Fallback include match
          const includes = Array.from(clonedSvg.querySelectorAll('[id]')).filter(el => 
            el.id.includes(cleanId)
          ) as SVGPathElement[]
          if (includes.length > 0) {
            includes.forEach(el => selected.push(el))
            return
          }
        })
        pathsToAnimate = selected
      }

      // Find animated path groups (for skip checking)
      const animatedPathAncestors = new Set<Element>()
      pathsToAnimate.forEach(path => {
        let parent = path.parentElement as Element | null
        while (parent && parent !== (clonedSvg as unknown as Element)) {
          animatedPathAncestors.add(parent)
          parent = parent.parentElement
        }
      })

      // Find all other visible shapes (excluding animated paths and their groups)
      const allElements = Array.from(clonedSvg.querySelectorAll<SVGElement>('*'))
      const otherShapes = allElements.filter(el => {
        // Skip if it's one of our animated paths
        if (pathsToAnimate.includes(el as SVGPathElement)) return false
        
        // Skip if it's an ancestor/group of animated paths
        if (animatedPathAncestors.has(el)) return false
        
        const tagName = el.tagName.toLowerCase()
        // Include all shape elements but NOT groups (groups can contain animated paths)
        if (!['path', 'circle', 'rect', 'polygon', 'ellipse', 'text'].includes(tagName)) return false
        
        // Check if element is visible
        const style = window.getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
      })

      // Set initial states
      gsap.set(clonedSvg, { 
        scale: 0, 
        opacity: 1,
        transformOrigin: 'center center' 
      })

      // Hide animated paths and other shapes initially
      gsap.set(pathsToAnimate, { opacity: 0 })
      gsap.set(otherShapes, { opacity: 0 })

      // DUAL-ENDED PATH ANIMATION for specified paths only
      if (pathsToAnimate.length > 0) {
        // Create gradient for the animated paths
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
        gradient.id = 'splash-gradient'
        gradient.setAttribute('x1', '0%')
        gradient.setAttribute('y1', '0%')
        gradient.setAttribute('x2', '100%')
        gradient.setAttribute('y2', '0%')
        
        gradient.innerHTML = `
          <stop offset="0%" stop-color="${gradientStart}"/>
          <stop offset="50%" stop-color="${gradientEnd}"/>
          <stop offset="100%" stop-color="#c0c0c0"/>
        `
        
        defs.appendChild(gradient)
        clonedSvg.insertBefore(defs, clonedSvg.firstChild)

        const animatedPathPairs: Array<{path1: SVGPathElement, path2: SVGPathElement, original: SVGPathElement}> = []

        pathsToAnimate.forEach(originalPath => {
          if (!('getTotalLength' in originalPath)) return

          const pathLength = originalPath.getTotalLength()
          
          // Create two copies for dual-ended animation
          const path1 = originalPath.cloneNode(true) as SVGPathElement
          const path2 = originalPath.cloneNode(true) as SVGPathElement
          
          path1.id = `path1-${Math.random().toString(36).substr(2, 9)}`
          path2.id = `path2-${Math.random().toString(36).substr(2, 9)}`
          
          // Insert the cloned paths
          originalPath.insertAdjacentElement('afterend', path1)
          originalPath.insertAdjacentElement('afterend', path2)
          
          // Hide the original path
          originalPath.style.display = 'none'

          // Style the animated paths
          gsap.set([path1, path2], { 
            stroke: 'url(#splash-gradient)',
            strokeWidth: strokeWidth,
            fill: 'none',
            opacity: 0  // Initially hidden until animation starts
          })

          // Set up dual-ended animation
          gsap.set([path1, path2], { 
            strokeDasharray: pathLength / 2
          })

          // Path1 animates from start to middle
          gsap.set(path1, { 
            strokeDashoffset: -pathLength / 2
          })

          // Path2 animates from end to middle  
          gsap.set(path2, { 
            strokeDashoffset: pathLength / 2
          })

          animatedPathPairs.push({ path1, path2, original: originalPath })
        })

        // 1. Fade in SVG
        tl.to(clonedSvg, { 
          duration: 0.5, 
          scale: 1
        })

        // 2. DUAL-ENDED ANIMATION - all specified paths animate toward center
        animatedPathPairs.forEach(({ path1, path2 }, pairIndex) => {
          const startLabel = pairIndex === 0 ? '-=0' : '-=1.2'
          
          // Show the cloned paths at the start of animation
          tl.to([path1, path2], {
            duration: 0,
            opacity: 1
          }, startLabel)
          
          tl.to(path1, {
            duration: 1.2,
            strokeDashoffset: 0,
            ease: "power2.out"
          }, startLabel)

          tl.to(path2, {
            duration: 1.2, 
            strokeDashoffset: 0,
            ease: "power2.out"
          }, '-=1.2')
        })

      } else {
        // Fallback if no paths found
        tl.to(clonedSvg, { 
          duration: 0.5, 
          scale: 1
        })
      }

      // 3. WAVE COLOR EFFECT for other shapes (top to bottom) - ALWAYS apply for non-animated elements
      if (otherShapes.length > 0) {
        // Filter out path elements from wave effect (we handle paths separately)
        const nonPathShapes = otherShapes.filter(el => el.tagName.toLowerCase() !== 'path')
        
        if (nonPathShapes.length > 0) {
          // Sort shapes by vertical position for wave effect
          const sortedShapes = nonPathShapes.sort((a, b) => {
            const rectA = a.getBoundingClientRect()
            const rectB = b.getBoundingClientRect()
            return rectA.top - rectB.top
          })

          // Show shapes with wave effect (staggered from top to bottom)
          sortedShapes.forEach((shape, index) => {
            tl.to(shape, {
              duration: 0.1,
              opacity: 1,
              fill: gradientStart,
              ease: "power2.out"
            }, `+=${index * 0.05}`) // Staggered start for wave effect
          })

          // Color cycle through gradient
          tl.to(sortedShapes, {
            duration: 0.1,
            fill: gradientEnd,
          }, '+=0.1')

          tl.to(sortedShapes, {
            duration: 0.1,
            fill: '#c0c0c0',
          }, '+=0.1')

          tl.to(sortedShapes, {
            duration: 0.1,
            fill: '', // Reset to original
          }, '+=0.1')
        }
      }

      // 4. ZOOM IN to cover screen
      tl.to(clonedSvg, { 
        duration: 1.2, 
        scale: splashScale * 3,
        ease: "power2.in"
      })

      // 5. Navigate after zoom completes
      tl.eventCallback('onComplete', () => {
        sessionStorage.setItem('needsFadeIn', 'true')
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay)
          }
        }, 50)
        
        if (href?.href) {
          if (href.target === '_blank') {
            window.open(href.href, '_blank')
          } else {
            router.push(href.href)
          }
        }
      })

    } catch (error) {
      console.error('LogoSplash animation failed:', error)
      if (href?.href) router.push(href.href)
    }
  }, [animatedPathId, gradientStart, gradientEnd, splashScale, strokeWidth, href, router])

  const onClick = useCallback((e: React.MouseEvent) => {
    if (!href?.href) return

    // Don't interfere if Makeswift animations are present
  const target = e.currentTarget
  if (target.hasAttribute('data-makeswift-animation') || 
      target.closest('[data-makeswift-animation]')) {
    return
  }
    
    e.preventDefault()

    if (href.target === '_blank') {
      window.open(href.href, '_blank')
      return
    }

    try {
      if (animationType === 'LogoSplash') {
        handleLogoSplash(e)
      } else {
        handleActraiserDrop(e)
      }
    } catch (error) {
      console.error('Transition animation failed:', error)
      router.push(href.href)
    }
  }, [href, animationType, handleActraiserDrop, handleLogoSplash, router])

  return (
    <div 
      ref={containerRef} 
      className={containerClassName}
      style={{ 
        cursor: href?.href ? 'pointer' : 'default',
        display: 'inline-block'
      }} 
      onClick={href?.href ? onClick : undefined}
    >
      {children || <div>Transition Link</div>}
    </div>
  )
}

export default TransitionLink