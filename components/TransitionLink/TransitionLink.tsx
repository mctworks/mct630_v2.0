'use client'

import { useRouter } from 'next/navigation'
import { ReactNode, useRef, useCallback, useEffect, HTMLAttributes } from 'react'
import { gsap } from 'gsap'

import { getEffectivePrefersReduced } from '@/lib/reducedMotion'

const shouldUseReducedMotion = (): boolean => {
  return getEffectivePrefersReduced()
}

interface TransitionLinkProps extends HTMLAttributes<HTMLDivElement> {
  href?: { href: string; target?: '_self' | '_blank' }
  className?: string
  containerClassName?: string
  children?: ReactNode
  animationType?: 'ActraiserDrop' | 'LogoSplash' | string
  transitionDuration?: number
  rotationSpeed?: number
  zoomScale?: number
  fadeOutDuration?: number
  splashImage?: string | { url: string; dimensions?: { width: number; height: number } } | undefined
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
  fadeOutDuration = 0.5,
  ...rest
}: TransitionLinkProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
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

    if (shouldUseReducedMotion()) {
      pageWrap.style.transition = `opacity ${fadeOutDuration}s ease`
      pageWrap.style.opacity = '0'
      
      navigationTimeoutRef.current = setTimeout(() => {
        sessionStorage.setItem('needsFadeIn', 'true')
        router.push(href.href)
      }, fadeOutDuration * 1000)
      
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

    const outDuration = typeof fadeOutDuration === 'number' ? fadeOutDuration : transitionDuration
    const startPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''

    navigationTimeoutRef.current = setTimeout(() => {
      sessionStorage.setItem('needsFadeIn', 'true')
      router.push(href.href)

      navigationTimeoutRef.current = setTimeout(() => {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
        if (currentPath === startPath) {
          router.push(href.href)
        }
      }, 2000)
    }, outDuration * 1000)
  }, [zoomScale, rotationSpeed, transitionDuration, fadeOutDuration, href, router])

  const performLogoSplashAnimation = useCallback(async (gsap: any, container: HTMLDivElement) => {
    try {
      let svg: SVGElement | null = null
      
      // Try to fetch splashImage if provided
      if (splashImage) {
        let url: string | undefined
        if (typeof splashImage === 'string') url = splashImage
        else if (splashImage && typeof splashImage === 'object') url = (splashImage as any).url

        if (url) {
          try {
            const resp = await fetch(url, { cache: 'no-cache' })
            if (resp.ok) {
              const text = await resp.text()
              const parser = new DOMParser()
              const doc = parser.parseFromString(text, 'image/svg+xml')
              const fetchedSvg = doc.querySelector('svg')
              if (fetchedSvg) {
                svg = fetchedSvg as SVGElement
              }
            }
          } catch (err) {
            console.warn('Failed to fetch splashImage, falling back to in-DOM SVG:', err)
          }
        }
      }

      // Fallback to in-DOM SVG
      if (!svg) {
        const tryFindInDom = async () => {
          let found: SVGElement | null = null
          for (let attempt = 0; attempt < 6; attempt++) {
            found = container.querySelector<SVGElement>('#logo') || container.querySelector<SVGElement>('svg')
            if (found) return found
            await new Promise(r => setTimeout(r, 60))
          }
          return null
        }
        svg = await tryFindInDom()
      }

      if (!svg) {
        throw new Error('SVG not found for LogoSplash animation')
      }

      // Create full-screen overlay
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
      
      // Clone SVG
      const clonedSvg = svg.cloneNode(true) as SVGElement
      clonedSvg.style.width = 'min(60vw, 300px)'
      clonedSvg.style.height = 'min(60vh, 300px)'
      
      clonedSvg.removeAttribute('filter')
      const allClonedElements = clonedSvg.querySelectorAll('*')
      allClonedElements.forEach(el => el.removeAttribute('filter'))
      
      overlay.appendChild(clonedSvg)
      document.body.appendChild(overlay)

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

      // Parse animated paths
      const normalizedAnimatePaths = !animatedPathId
        ? []
        : String(animatedPathId).split(',').map(p => p.trim()).filter(Boolean)

      let pathsToAnimate: SVGElement[] = []
      if (normalizedAnimatePaths.length > 0 && !normalizedAnimatePaths.includes('none')) {
        if (normalizedAnimatePaths.length === 1 && normalizedAnimatePaths[0] === 'all') {
          pathsToAnimate = Array.from(clonedSvg.querySelectorAll<SVGElement>('path'))
        } else {
          const selected: SVGElement[] = []
          normalizedAnimatePaths.forEach(id => {
            const cleanId = id.replace(/^#/, '').trim()
            if (!cleanId) return
            try {
              const exact = clonedSvg.querySelector(`#${CSS.escape(cleanId)}`)
              if (exact) {
                selected.push(exact as SVGElement)
                return
              }
            } catch (err) {}
            const ends = Array.from(clonedSvg.querySelectorAll('[id]')).filter(el => 
              el.id.endsWith(`-${cleanId}`) || el.id.endsWith(`_${cleanId}`) || el.id === cleanId
            ) as SVGElement[]
            if (ends.length > 0) {
              ends.forEach(el => selected.push(el))
              return
            }
            const includes = Array.from(clonedSvg.querySelectorAll('[id]')).filter(el => 
              el.id.includes(cleanId)
            ) as SVGElement[]
            if (includes.length > 0) {
              includes.forEach(el => selected.push(el))
            }
          })
          pathsToAnimate = selected
        }
      }

      const animatedPathSet = new Set(pathsToAnimate)

      const allElements = Array.from(clonedSvg.querySelectorAll<SVGElement>('*'))
      const elementsForColorWave = allElements.filter(el => {
        if (animatedPathSet.has(el as SVGPathElement)) return false
        const tagName = el.tagName.toLowerCase()
        if (['defs', 'clippath', 'mask', 'pattern', 'lineargradient', 'radialgradient', 'stop', 'filter', 'g', 'svg'].includes(tagName)) return false
        return true
      })

      gsap.set(clonedSvg, { scale: 0, opacity: 1, transformOrigin: 'center center' })
      gsap.set(pathsToAnimate, { opacity: 0 })

      // Fade in SVG
      tl.to(clonedSvg, { duration: 0.5, scale: 1 })

      // Dual-ended path animation
      if (pathsToAnimate.length > 0) {
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

        pathsToAnimate.forEach(originalEl => {
          let elLength = 0
          try {
            if ('getTotalLength' in originalEl && typeof (originalEl as any).getTotalLength === 'function') {
              elLength = (originalEl as any).getTotalLength()
            } else if ('getComputedTextLength' in originalEl && typeof (originalEl as any).getComputedTextLength === 'function') {
              elLength = (originalEl as any).getComputedTextLength()
            }
          } catch (err) {}

          if (!elLength || elLength === 0) return

          const path1 = originalEl.cloneNode(true) as SVGElement
          const path2 = originalEl.cloneNode(true) as SVGElement

          path1.id = `path1-${Math.random().toString(36).substr(2, 9)}`
          path2.id = `path2-${Math.random().toString(36).substr(2, 9)}`

          originalEl.insertAdjacentElement('afterend', path1 as Element)
          originalEl.insertAdjacentElement('afterend', path2 as Element)

          try { (originalEl as any).style.display = 'none' } catch (err) {}

          gsap.set([path1, path2], {
            stroke: 'url(#splash-gradient)',
            strokeWidth: strokeWidth,
            fill: 'none',
            opacity: 0
          })

          gsap.set([path1, path2], { strokeDasharray: elLength })
          gsap.set(path1, { strokeDashoffset: elLength })
          gsap.set(path2, { strokeDashoffset: -elLength })

          animatedPathPairs.push({ path1: path1 as any, path2: path2 as any, original: originalEl as any, pathLength: elLength })
        })

        animatedPathPairs.forEach(({ path1, path2, pathLength }, pairIndex) => {
          const startLabel = pairIndex === 0 ? '-=0' : '-=1.2'
          
          tl.to([path1, path2], { duration: 0, opacity: 1 }, startLabel)
          tl.to(path1, { duration: 1.2, strokeDashoffset: pathLength / 2, ease: "power2.out" }, startLabel)
          tl.to(path2, { duration: 1.2, strokeDashoffset: -pathLength / 2, ease: "power2.out" }, '-=1.2')
        })
      }

      // Zoom in
      if (shouldUseReducedMotion()) {
        tl.to(overlay, { duration: 0.5, opacity: 0, ease: "power2.out" }, '+=0.2')
      } else {
        tl.to(clonedSvg, { duration: 1.2, scale: splashScale * 3, ease: "power2.in" }, '+=0.2')
      }

      // Navigate after animation
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
  }, [animatedPathId, gradientStart, gradientEnd, splashScale, strokeWidth, href, router, splashImage])

  const handleLogoSplash = useCallback((e: React.MouseEvent) => {
    try {
      e.preventDefault()
      
      let container = containerRef.current as HTMLDivElement | null
      if (!container) {
        const fallback = e.currentTarget as HTMLElement
        if (fallback) {
          container = fallback as HTMLDivElement
        }
      }

      if (!container) {
        if (href?.href) router.push(href.href)
        return
      }

      const isInEditor = typeof window !== 'undefined' && window.location.search.includes('makeswift=1')
      
      if (isInEditor) {
        if (href?.href && href.target !== '_blank') {
          router.push(href.href)
        }
        return
      }

      import('gsap').then(({ gsap }) => {
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
  }, [href, router, performLogoSplashAnimation])

  const activate = useCallback((e?: any) => {
    if (!href?.href) return

    try {
      if (href.target === '_blank') {
        window.open(href.href, '_blank')
        return
      }

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

  const onClick = useCallback((e: React.MouseEvent) => {
    if (!href?.href) return

    const target = e.currentTarget as HTMLElement
    const makeswiftEl = target.hasAttribute('data-makeswift-animation') ? target : target.closest('[data-makeswift-animation]')
    if (makeswiftEl) {
      console.warn('Makeswift animation marker present - proceeding anyway')
    }

    e.preventDefault()
    activate(e)
  }, [href, activate])

  return (
    <div 
      ref={containerRef} 
      className={`${containerClassName ?? ''} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]`}
      style={{ 
        cursor: href?.href ? 'pointer' : 'default',
        display: 'inline-block'
      }}
      role={rest.role ?? (href?.href ? 'link' : undefined)}
      tabIndex={rest.tabIndex ?? (href?.href ? 0 : undefined)}
      onClick={href?.href ? onClick : undefined}
      onKeyDown={(e) => {
        if (!href?.href) return
        const key = e.key
        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
          e.preventDefault()
          activate(e)
        }
      }}
      {...rest}
    >
      {children || <div>Transition Link</div>}
    </div>
  )
}

export default TransitionLink