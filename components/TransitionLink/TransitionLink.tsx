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

  useEffect(() => {
    const pageWrap = document.getElementById('page-wrap')
    if (pageWrap) {
      pageWrap.style.opacity = '0'
      pageWrap.classList.remove('fade-in')
      
      setTimeout(() => {
        pageWrap.style.removeProperty('opacity')
        pageWrap.classList.add('fade-in')
      }, 50)
    }
  }, [])

  useEffect(() => {
    const pageWrap = document.getElementById('page-wrap')
    if (pageWrap) {
      pageWrap.classList.remove('transitioning')
      pageWrap.style.removeProperty('--scale')
      pageWrap.style.removeProperty('--rotation')
      pageWrap.style.removeProperty('--transition-duration')
      pageWrap.style.removeProperty('transform-origin')

      gsap.set(pageWrap, {
        clearProps: 'all',
      })
    }

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
        xPercent = (e.clientX / window.innerWidth) * 100
        yPercent = (e.clientY / window.innerHeight) * 100
      }
    } catch (err) {
      xPercent = 50
      yPercent = 50
    }

    pageWrap.classList.remove('transitioning')
    void pageWrap.offsetWidth

    pageWrap.style.setProperty('--scale', String(zoomScale))
    pageWrap.style.setProperty('--rotation', `${rotationSpeed}deg`)
    pageWrap.style.setProperty('--transition-duration', `${transitionDuration}s`)
    pageWrap.style.transformOrigin = `${xPercent}% ${yPercent}%`

    pageWrap.classList.add('transitioning')

    setTimeout(() => {
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

      import('gsap').then(({ gsap }) => {
        // performLogoSplashAnimation may be async when loading external SVGs
        Promise.resolve(performLogoSplashAnimation(gsap, container)).catch(err => {
          console.error('LogoSplash animation failed:', err)
          if (href?.href) router.push(href.href)
        })
      }).catch(error => {
        console.error('Failed to load GSAP:', error)
        if (href?.href) router.push(href.href)
      })
    } catch (error) {
      console.error('LogoSplash setup failed:', error)
      if (href?.href) router.push(href.href)
    }
  }, [href, router])

  //eslint-disable-next-line react-hooks/exhaustive-deps
  const performLogoSplashAnimation = useCallback(async (gsap: any, container: HTMLDivElement) => {
    try {
      // If a splashImage prop is provided, prefer fetching and using that SVG
      let svg: SVGElement | null = null
      try {
        if (splashImage) {
          let url: string | undefined
          if (typeof splashImage === 'string') url = splashImage
          else if (splashImage && typeof splashImage === 'object') url = (splashImage as any).url

          if (url) {
            const resp = await fetch(url, { cache: 'no-cache' })
            if (resp.ok) {
              const text = await resp.text()
              const parser = new DOMParser()
              const doc = parser.parseFromString(text, 'image/svg+xml')
              const fetchedSvg = doc.querySelector('svg')
              if (fetchedSvg) {
                // Use the fetched SVG for splash animation (prevents EnhancedSVG animation interference)
                svg = fetchedSvg as SVGElement
              }
            }
          }
        }
      } catch (err) {
        // If fetching fails, we'll fallback to in-DOM SVG
        console.warn('Failed to fetch splashImage for LogoSplash, falling back to in-DOM SVG:', err)
      }

      if (!svg) {
        svg = container.querySelector<SVGElement>('#logo') || container.querySelector<SVGElement>('svg')
      }

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
      
      overlay.classList.add('animation-overlay')
      
      // Clone SVG and make it larger for the overlay
      const clonedSvg = svg.cloneNode(true) as SVGElement
      clonedSvg.style.width = 'min(60vw, 300px)'
      clonedSvg.style.height = 'min(60vh, 300px)'
      
      // Remove any theme-related filters or styles from cloned SVG
      clonedSvg.removeAttribute('filter')
      const allClonedElements = clonedSvg.querySelectorAll('*')
      allClonedElements.forEach(el => {
        el.removeAttribute('filter')
      })
      
      overlay.appendChild(clonedSvg)
      document.body.appendChild(overlay)

      const tl = gsap.timeline({ 
        defaults: { ease: 'power2.inOut' } 
      })

      // Parse animated paths
      const normalizedAnimatePaths = !animatedPathId
        ? []
        : String(animatedPathId).split(',').map(p => p.trim()).filter(Boolean)

      // Determine which paths to animate. Support 'all' to animate every <path>
      let pathsToAnimate: SVGPathElement[] = []
      if (normalizedAnimatePaths.length > 0 && !normalizedAnimatePaths.includes('none')) {
        if (normalizedAnimatePaths.length === 1 && normalizedAnimatePaths[0] === 'all') {
          pathsToAnimate = Array.from(clonedSvg.querySelectorAll<SVGPathElement>('path'))
        } else {
          const selected: SVGPathElement[] = []
          normalizedAnimatePaths.forEach(id => {
            const cleanId = id.replace(/^#/, '').trim()
            if (!cleanId) return
            // Exact match
            try {
              const exact = clonedSvg.querySelector(`#${CSS.escape(cleanId)}`)
              if (exact && exact instanceof SVGPathElement) {
                selected.push(exact)
                return
              }
            } catch (err) {
              // ignore
            }
            // Ends-with match
            const ends = Array.from(clonedSvg.querySelectorAll('[id]')).filter(el => 
              el.id.endsWith(`-${cleanId}`) || el.id.endsWith(`_${cleanId}`) || el.id === cleanId
            ) as SVGPathElement[]
            if (ends.length > 0) {
              ends.forEach(el => selected.push(el))
              return
            }
            // Includes match
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
      }

      // Create a Set for quick lookup of animated paths
      const animatedPathSet = new Set(pathsToAnimate)

      // Find ALL visible elements for color wave (everything except animated paths)
      const allElements = Array.from(clonedSvg.querySelectorAll<SVGElement>('*'))
      const elementsForColorWave = allElements.filter(el => {
        // Skip if it's one of our animated paths
        if (animatedPathSet.has(el as SVGPathElement)) return false
        
        const tagName = el.tagName.toLowerCase()
        // Skip defs and other non-visual elements
        if (['defs', 'clippath', 'mask', 'pattern', 'lineargradient', 'radialgradient', 'stop', 'filter', 'g', 'svg'].includes(tagName)) return false
        
        // Include ALL visual elements
        return true
      })

      // Set initial states
      gsap.set(clonedSvg, { 
        scale: 0, 
        opacity: 1,
        transformOrigin: 'center center' 
      })

      // Hide ONLY animated paths initially
      gsap.set(pathsToAnimate, { opacity: 0 })

      // 1. Fade in SVG
      tl.to(clonedSvg, { 
        duration: 0.5, 
        scale: 1
      })

      // 2. DUAL-ENDED PATH ANIMATION for specified paths only
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
          <stop offset="100%" stop-color="${gradientStart}"/>
        `
        
        defs.appendChild(gradient)
        clonedSvg.insertBefore(defs, clonedSvg.firstChild)

        const animatedPathPairs: Array<{path1: SVGPathElement, path2: SVGPathElement, original: SVGPathElement, pathLength: number}> = []

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

          // Style the animated paths - use gradient stroke
          gsap.set([path1, path2], { 
            stroke: 'url(#splash-gradient)',
            strokeWidth: strokeWidth,
            fill: 'none',
            opacity: 0
          })

          // Set up dual-ended animation - FULL path length for each
          gsap.set([path1, path2], { 
            strokeDasharray: pathLength
          })

          // Path1 animates from START (0) to MIDDLE
          gsap.set(path1, { 
            strokeDashoffset: pathLength // Start hidden at the end
          })

          // Path2 animates from END to MIDDLE  
          gsap.set(path2, { 
            strokeDashoffset: -pathLength // Start hidden at the beginning
          })

          animatedPathPairs.push({ path1, path2, original: originalPath, pathLength })
        })

        // Animate all path pairs simultaneously - both converge to center
        animatedPathPairs.forEach(({ path1, path2, pathLength }, pairIndex) => {
          const startLabel = pairIndex === 0 ? '-=0' : '-=1.2'
          
          // Show the cloned paths
          tl.to([path1, path2], {
            duration: 0,
            opacity: 1
          }, startLabel)
          
          // Path1: animate from start to middle (dashoffset: pathLength -> pathLength/2)
          tl.to(path1, {
            duration: 1.2,
            strokeDashoffset: pathLength / 2,
            ease: "power2.out"
          }, startLabel)

          // Path2: animate from end to middle (dashoffset: -pathLength -> -pathLength/2)
          tl.to(path2, {
            duration: 1.2, 
            strokeDashoffset: -pathLength / 2,
            ease: "power2.out"
          }, '-=1.2')
        })
      }

      // 3. WAVE COLOR EFFECT for ALL visual elements
     /*  if (elementsForColorWave.length > 0) {
        // Sort by vertical position (top to bottom)
        const sortedShapes = [...elementsForColorWave].sort((a, b) => {
          const rectA = a.getBoundingClientRect()
          const rectB = b.getBoundingClientRect()
          return rectA.top - rectB.top
        })

        // Create filters for images (EnhancedSVG approach)
        const defs = clonedSvg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        if (!clonedSvg.querySelector('defs')) {
          clonedSvg.insertBefore(defs, clonedSvg.firstChild)
        }
        
        const startFilterId = 'wave-start-' + Math.random().toString(36).substr(2, 9)
        const startFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
        startFilter.id = startFilterId
        startFilter.innerHTML = `
          <feFlood flood-color="${gradientStart}" result="flood"/>
          <feComposite in="flood" in2="SourceAlpha" operator="in" result="colored"/>
          <feBlend in="colored" in2="SourceGraphic" mode="multiply"/>
        `
        defs.appendChild(startFilter)
        
        const endFilterId = 'wave-end-' + Math.random().toString(36).substr(2, 9)
        const endFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
        endFilter.id = endFilterId
        endFilter.innerHTML = `
          <feFlood flood-color="${gradientEnd}" result="flood"/>
          <feComposite in="flood" in2="SourceAlpha" operator="in" result="colored"/>
          <feBlend in="colored" in2="SourceGraphic" mode="multiply"/>
        `
        defs.appendChild(endFilter)

        // Wave starts AFTER path animation (1.2s)
        const waveStart = 1.2
        const waveDuration = 0.4
        const stagger = waveDuration / Math.max(sortedShapes.length, 1)

        // Single wave from top to bottom
        sortedShapes.forEach((shape, index) => {
          const tagName = shape.tagName.toLowerCase()
          const computedStyle = window.getComputedStyle(shape)
          const hasFill = computedStyle.fill && computedStyle.fill !== 'none'
          const hasStroke = computedStyle.stroke && computedStyle.stroke !== 'none'
          
          const elementStart = waveStart + (index * stagger)
          
          if (tagName === 'image') {
            // Images: gradientStart → gradientEnd
            tl.to(shape, {
              duration: 0.1,
              attr: { filter: `url(#${startFilterId})` },
              ease: "power2.out"
            }, elementStart)
            
            tl.to(shape, {
              duration: 0.1,
              attr: { filter: `url(#${endFilterId})` },
              ease: "power2.inOut"
            }, elementStart + 0.05)
            
          } else if (hasFill || hasStroke) {
            // Regular shapes: gradientStart → gradientEnd
            tl.to(shape, {
              duration: 0.1,
              fill: gradientStart,
              stroke: gradientStart,
              ease: "power2.out"
            }, elementStart)
            
            tl.to(shape, {
              duration: 0.1,
              fill: gradientEnd,
              stroke: gradientEnd,
              ease: "power2.inOut"
            }, elementStart + 0.05)
          }
        })
      } */
        // 3. WAVE COLOR EFFECT for ALL visual elements (respects transparency)
      if (elementsForColorWave.length > 0) {
        // Filter to only elements with visible fill/stroke
        const visibleElements = elementsForColorWave.filter(el => {
          const computedStyle = window.getComputedStyle(el)
          const tagName = el.tagName.toLowerCase()
          
          // Skip elements that are completely transparent
          if (parseFloat(computedStyle.opacity) === 0) return false
          
          // For images, always include (they're visible by default)
          if (tagName === 'image') return true
          
          // Check fill visibility
          const fill = computedStyle.fill
          const hasVisibleFill = fill && 
            fill !== 'none' && 
            fill !== 'transparent' &&
            !fill.startsWith('rgba(0,0,0,0') &&
            !fill.startsWith('rgba(255,255,255,0')
          
          // Check stroke visibility
          const stroke = computedStyle.stroke
          const hasVisibleStroke = stroke && 
            stroke !== 'none' && 
            stroke !== 'transparent' &&
            !stroke.startsWith('rgba(0,0,0,0') &&
            !stroke.startsWith('rgba(255,255,255,0')
          
          // Include if has visible fill OR stroke
          return hasVisibleFill || hasVisibleStroke
        })
        
        if (visibleElements.length === 0) return
        
        // Sort by vertical position (top to bottom)
        const sortedShapes = visibleElements.sort((a, b) => {
          const rectA = a.getBoundingClientRect()
          const rectB = b.getBoundingClientRect()
          return rectA.top - rectB.top
        })

        // Create filters for images (EnhancedSVG approach)
        const defs = clonedSvg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        if (!clonedSvg.querySelector('defs')) {
          clonedSvg.insertBefore(defs, clonedSvg.firstChild)
        }
        
        const startFilterId = 'wave-start-' + Math.random().toString(36).substr(2, 9)
        const startFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
        startFilter.id = startFilterId
        startFilter.innerHTML = `
          <feFlood flood-color="${gradientStart}" result="flood"/>
          <feComposite in="flood" in2="SourceAlpha" operator="in" result="colored"/>
          <feBlend in="colored" in2="SourceGraphic" mode="multiply"/>
        `
        defs.appendChild(startFilter)
        
        const endFilterId = 'wave-end-' + Math.random().toString(36).substr(2, 9)
        const endFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
        endFilter.id = endFilterId
        endFilter.innerHTML = `
          <feFlood flood-color="${gradientEnd}" result="flood"/>
          <feComposite in="flood" in2="SourceAlpha" operator="in" result="colored"/>
          <feBlend in="colored" in2="SourceGraphic" mode="multiply"/>
        `
        defs.appendChild(endFilter)

        // Wave starts AFTER path animation (1.2s)
        const waveStart = 1.2
        const waveDuration = 0.4
        const stagger = waveDuration / Math.max(sortedShapes.length, 1)

        // Store original styles for restoration if needed
        const originalStyles = new Map<SVGElement, {
          fill: string | null,
          stroke: string | null,
          filter: string | null
        }>()

        // Single wave from top to bottom
        sortedShapes.forEach((shape, index) => {
          const tagName = shape.tagName.toLowerCase()
          const computedStyle = window.getComputedStyle(shape)
          
          // Store original styles
          originalStyles.set(shape, {
            fill: shape.getAttribute('fill'),
            stroke: shape.getAttribute('stroke'),
            filter: shape.getAttribute('filter')
          })
          
          // Check what properties should be animated
          const fill = computedStyle.fill
          const stroke = computedStyle.stroke
          
          const shouldAnimateFill = fill && 
            fill !== 'none' && 
            fill !== 'transparent' &&
            !fill.startsWith('rgba(0,0,0,0')
          
          const shouldAnimateStroke = stroke && 
            stroke !== 'none' && 
            stroke !== 'transparent' &&
            !stroke.startsWith('rgba(0,0,0,0')
          
          const elementStart = waveStart + (index * stagger)
          
          if (tagName === 'image') {
            // For images: apply filter animation
            tl.to(shape, {
              duration: 0.1,
              attr: { filter: `url(#${startFilterId})` },
              ease: "power2.out"
            }, elementStart)
            
            tl.to(shape, {
              duration: 0.1,
              attr: { filter: `url(#${endFilterId})` },
              ease: "power2.inOut"
            }, elementStart + 0.05)
            
          } else if (shouldAnimateFill || shouldAnimateStroke) {
            // For regular shapes: only animate visible properties
            // First color (gradientStart)
            const startUpdates: any = {
              duration: 0.1,
              ease: "power2.out"
            }
            
            if (shouldAnimateFill) startUpdates.fill = gradientStart
            if (shouldAnimateStroke) startUpdates.stroke = gradientStart
            
            tl.to(shape, startUpdates, elementStart)
            
            // Second color (gradientEnd)
            const endUpdates: any = {
              duration: 0.1,
              ease: "power2.inOut"
            }
            
            if (shouldAnimateFill) endUpdates.fill = gradientEnd
            if (shouldAnimateStroke) endUpdates.stroke = gradientEnd
            
            tl.to(shape, endUpdates, elementStart + 0.05)
          }
        })
      }
    
      // 4. ZOOM IN to cover screen
      tl.to(clonedSvg, { 
        duration: 1.2, 
        scale: splashScale * 3,
        ease: "power2.in"
      }, '+=0.2')

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