'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@/components/ThemeConfig/ThemeConfig'
import { gsap } from 'gsap'

interface EnhancedSVGProps {
  className?: string
  svg?: { url: string; dimensions?: { width: number; height: number } }
  lightStrokeColor?: string
  darkStrokeColor?: string
  enableGradientDraw?: boolean
  gradientStartColor?: string
  gradientEndColor?: string
  gradientDuration?: number
  resetDuration?: number 
  logoStrokeWidth?: number
  animatePaths?: string[] | string
}

export function EnhancedSVG({
  className,
  svg,
  lightStrokeColor = '#000000',
  darkStrokeColor = '#ffffff',
  enableGradientDraw = false,
  gradientStartColor = '#000000',
  gradientEndColor = '#ffffff',
  gradientDuration = 2,
  resetDuration = 0.3,
  logoStrokeWidth = 2,
  animatePaths = ['all'],
}: EnhancedSVGProps) {
  const { isDark } = useTheme()
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)

  const strokeColor = isDark ? darkStrokeColor : lightStrokeColor

  const normalizedAnimatePaths = React.useMemo(() => {
    if (Array.isArray(animatePaths)) {
      return animatePaths
    }
    if (typeof animatePaths === 'string') {
      const trimmed = animatePaths.trim()
      if (trimmed === 'all') return ['all']
      if (trimmed === 'none') return []
      return trimmed.split(',').map(p => p.trim()).filter(Boolean)
    }
    return ['all']
  }, [animatePaths])

  // FIXED: Only apply color to strokes, preserve fills
  const applyColorToSVG = useCallback((svgEl: SVGElement, color: string) => {
    console.log('Applying stroke color to SVG:', color)
    
    // Remove any existing filters
    const existingDefs = svgEl.querySelector('defs')
    if (existingDefs) {
      existingDefs.remove()
    }

    // Apply to all elements but PRESERVE fills
    const elements = svgEl.querySelectorAll('*')
    elements.forEach(el => {
      if (el.tagName.toLowerCase() === 'defs') return
      
      const tagName = el.tagName.toLowerCase()
      const originalStroke = el.getAttribute('stroke')
      const style = el.getAttribute('style') || ''

      // Skip if element is currently animated
      if (el.hasAttribute('data-original-stroke')) {
        return
      }

      const hasVisibleStroke = (
        (originalStroke && originalStroke !== 'none' && originalStroke !== 'transparent') ||
        (style.includes('stroke:') && !style.includes('stroke: none') && !style.includes('stroke: transparent'))
      )

      // ONLY apply color to strokes - DO NOT touch fills
      if (hasVisibleStroke) {
        el.setAttribute('stroke', color)
        const svgElement = el as SVGElement
        svgElement.style.setProperty('stroke', color, 'important')
      }
      
      // For image elements, create a filter that only affects strokes
      if (tagName === 'image' && hasVisibleStroke) {
        if (!svgEl.querySelector('defs')) {
          const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
          svgEl.insertBefore(defs, svgEl.firstChild)
        }
        
        const defsEl = svgEl.querySelector('defs')
        const filterId = 'stroke-colorize-' + Math.random().toString(36).substr(2, 9)
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
        filter.id = filterId
        filter.innerHTML = `
          <feFlood flood-color="${color}" result="flood"/>
          <feComposite in="flood" in2="SourceAlpha" operator="in" result="colored"/>
          <feComposite in="colored" in2="SourceGraphic" operator="over"/>
        `
        defsEl?.appendChild(filter)
        el.setAttribute('filter', `url(#${filterId})`)
      }
    })
  }, [])

  useEffect(() => {
    if (!svg?.url || !containerRef.current) return

    console.log('🚀 Initializing EnhancedSVG...')

    fetch(svg.url)
      .then(res => res.text())
      .then(text => {
        if (!text.includes('<svg')) return
        
        setSvgContent(text)

        const wrapper = containerRef.current?.querySelector('.icon-fill')
        if (!wrapper) return

        if (!wrapper.querySelector('svg')) {
          wrapper.innerHTML = text
        }
        const svgEl = wrapper.querySelector('svg')
        if (!svgEl) return
        
        console.log('✅ SVG loaded')
        
        // Apply initial color
        applyColorToSVG(svgEl, strokeColor)
        
        // Setup animation if enabled
        if (enableGradientDraw) {
          console.log('🎬 Setting up animation...')
          setTimeout(() => setupAnimation(svgEl), 200)
        }
      })
      .catch(console.error)
  }, [svg?.url, enableGradientDraw, applyColorToSVG, strokeColor])

  useEffect(() => {
    if (!containerRef.current || !svgContent) return
    
    const svgEl = containerRef.current.querySelector('svg')
    if (svgEl) {
      console.log('🎨 Theme changed, updating color...', strokeColor)
      applyColorToSVG(svgEl, strokeColor)
    }
  }, [strokeColor, svgContent, applyColorToSVG])

  const setupAnimation = useCallback((svgEl: SVGElement) => {
    if (!enableGradientDraw || !svgEl) return
    
    console.log('🎬 Starting animation setup with theme color:', strokeColor)

    if (animationRef.current) {
      animationRef.current.kill()
    }

    let elementsToAnimate: Element[] = []
    if (normalizedAnimatePaths.includes('all')) {
      elementsToAnimate = Array.from(svgEl.querySelectorAll('path, line, polyline, polygon, circle, rect, ellipse'))
    } else if (normalizedAnimatePaths.length === 0) {
      elementsToAnimate = []
    } else {
      const selected: Element[] = []
      normalizedAnimatePaths.forEach(id => {
        const cleanId = id.replace(/^#/, '').trim()
        if (!cleanId) return
        try {
          const exact = svgEl.querySelector(`#${CSS.escape(cleanId)}`)
          if (exact) {
            selected.push(exact)
            return
          }
        } catch (err) {}
        const ends = Array.from(svgEl.querySelectorAll('[id]')).filter(el => 
          el.id.endsWith(`-${cleanId}`) || el.id.endsWith(`_${cleanId}`) || el.id === cleanId
        )
        if (ends.length > 0) {
          ends.forEach(el => selected.push(el))
          return
        }
        const includes = Array.from(svgEl.querySelectorAll('[id]')).filter(el => el.id.includes(cleanId))
        if (includes.length > 0) {
          includes.forEach(el => selected.push(el))
        }
      })
      elementsToAnimate = selected
    }

    console.log(`🔍 Found ${elementsToAnimate.length} elements to animate`)

    if (elementsToAnimate.length === 0) return

    const tl = gsap.timeline({ 
      repeat: -1,
      repeatDelay: 0.8
    })

    elementsToAnimate.forEach((shape, i) => {
      const svgShape = shape as SVGElement
      const tagName = svgShape.tagName.toLowerCase()
      
      const originalFill = svgShape.getAttribute('fill') || ''
      const originalStroke = svgShape.getAttribute('stroke') || ''
      const originalStrokeWidth = svgShape.getAttribute('stroke-width') || ''
      
      svgShape.setAttribute('data-original-fill', originalFill)
      svgShape.setAttribute('data-original-stroke', originalStroke)
      svgShape.setAttribute('data-original-stroke-width', originalStrokeWidth)

      try {
        const length = getPathLength(svgShape)
        if (!length || length === 0) return

        svgShape.style.strokeDasharray = `${length}`
        svgShape.style.strokeDashoffset = `${length}`
        svgShape.style.strokeWidth = `${logoStrokeWidth}px`
        svgShape.style.stroke = strokeColor
        
        // CRITICAL: Preserve original fills, only set to 'none' if it was originally none
        if (originalFill === 'none' || !originalFill) {
          svgShape.style.fill = 'none'
        } else {
          svgShape.style.fill = originalFill
        }

        // Animation sequence
        tl.to(svgShape, {
          strokeDashoffset: 0,
          stroke: gradientStartColor,
          duration: gradientDuration * 0.4,
          ease: "power2.out"
        }, i * 0.4)

        tl.to(svgShape, {
          stroke: gradientEndColor,
          duration: gradientDuration * 0.3,
          ease: "power1.inOut"
        }, `+=0.1`)

        tl.to(svgShape, {
          strokeDashoffset: -length,
          stroke: strokeColor,
          duration: gradientDuration * resetDuration,
          ease: "power2.in"
        }, `+=0.2`)

      } catch (error) {
        console.error(`Error animating element ${i}:`, error)
      }
    })

    animationRef.current = tl
    console.log('✅ Animation timeline created')
  }, [enableGradientDraw, gradientStartColor, gradientEndColor, gradientDuration, logoStrokeWidth, normalizedAnimatePaths, strokeColor, resetDuration])

  useEffect(() => {
    if (!enableGradientDraw || !containerRef.current || !svgContent) return
    
    const svgEl = containerRef.current.querySelector('svg')
    if (svgEl && animationRef.current) {
      console.log('🎨 Updating animation with new theme color:', strokeColor)
      setTimeout(() => setupAnimation(svgEl), 100)
    }
  }, [strokeColor, enableGradientDraw, svgContent, setupAnimation])

  useEffect(() => {
    if (!containerRef.current || !svgContent) return
    const wrapper = containerRef.current.querySelector('.icon-fill')
    if (!wrapper) return
    const existing = wrapper.querySelector('svg')
    if (!existing) {
      wrapper.innerHTML = svgContent
      const svgEl = wrapper.querySelector('svg')
      if (svgEl) {
        applyColorToSVG(svgEl, strokeColor)
        if (enableGradientDraw) {
          setTimeout(() => setupAnimation(svgEl), 200)
        }
      }
    }
  }, [svgContent, enableGradientDraw, applyColorToSVG, setupAnimation, strokeColor])

  const cleanupAnimation = useCallback((svgEl: SVGElement | null) => {
    if (animationRef.current) {
      animationRef.current.kill()
      animationRef.current = null
    }

    if (svgEl) {
      const animatedElements = svgEl.querySelectorAll('[data-original-fill]')
      animatedElements.forEach(el => {
        const svgEl = el as SVGElement
        const originalFill = svgEl.getAttribute('data-original-fill')
        const originalStroke = svgEl.getAttribute('data-original-stroke')
        const originalStrokeWidth = svgEl.getAttribute('data-original-stroke-width')
        
        if (originalFill !== null && originalFill !== '') {
          svgEl.style.fill = originalFill
        } else {
          svgEl.style.removeProperty('fill')
        }
        
        svgEl.style.stroke = strokeColor
        
        if (originalStrokeWidth !== null && originalStrokeWidth !== '') {
          svgEl.style.strokeWidth = originalStrokeWidth
        } else {
          svgEl.style.removeProperty('stroke-width')
        }
        
        svgEl.removeAttribute('data-original-fill')
        svgEl.removeAttribute('data-original-stroke')
        svgEl.removeAttribute('data-original-stroke-width')
        
        svgEl.style.removeProperty('stroke-dasharray')
        svgEl.style.removeProperty('stroke-dashoffset')
      })
    }
  }, [strokeColor])

  const observerRef = useRef<MutationObserver | null>(null)

  const ensureSVGInjected = useCallback(async () => {
    try {
      if (!containerRef.current || !svg || !svg.url) return
      const wrapper = containerRef.current.querySelector('.icon-fill')
      if (!wrapper) return
      const existing = wrapper.querySelector('svg')
      if (existing) return

      if (svgContent) {
        console.warn('EnhancedSVG: wrapper lost <svg>, re-injecting cached content')
        wrapper.innerHTML = svgContent
        const svgEl = wrapper.querySelector('svg')
        if (svgEl) {
          applyColorToSVG(svgEl, strokeColor)
          if (enableGradientDraw) setTimeout(() => setupAnimation(svgEl), 200)
        }
        return
      }

      console.warn('EnhancedSVG: wrapper lost <svg> and no cached content, refetching', svg.url)
      const resp = await fetch(svg.url, { cache: 'no-cache' })
      if (!resp.ok) return
      const text = await resp.text()
      if (!text.includes('<svg')) return
      setSvgContent(text)
      wrapper.innerHTML = text
      const svgEl = wrapper.querySelector('svg')
      if (svgEl) {
        applyColorToSVG(svgEl, strokeColor)
        if (enableGradientDraw) setTimeout(() => setupAnimation(svgEl), 200)
      }
    } catch (err) {
      console.error('EnhancedSVG: ensureSVGInjected error', err)
    }
  }, [svg, svgContent, applyColorToSVG, enableGradientDraw, setupAnimation, strokeColor])

  useEffect(() => {
    if (!containerRef.current) return
    const wrapper = containerRef.current.querySelector('.icon-fill')
    if (!wrapper) return

    observerRef.current = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          const wrapperHasSvg = !!wrapper.querySelector('svg')
          if (!wrapperHasSvg) {
            setTimeout(() => ensureSVGInjected(), 50)
          }
        }
      }
    })

    observerRef.current.observe(wrapper, { childList: true, subtree: false })
    ensureSVGInjected().catch(() => {})

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [ensureSVGInjected])

  const getPathLength = (el: Element): number => {
    try {
      if (el instanceof SVGPathElement) return el.getTotalLength()
      if (el instanceof SVGLineElement) {
        const x1 = parseFloat(el.getAttribute('x1') || '0')
        const y1 = parseFloat(el.getAttribute('y1') || '0')
        const x2 = parseFloat(el.getAttribute('x2') || '0')
        const y2 = parseFloat(el.getAttribute('y2') || '0')
        return Math.hypot(x2 - x1, y2 - y1)
      }
      if (el instanceof SVGPolylineElement || el instanceof SVGPolygonElement) {
        const pts = (el as any).points
        let len = 0
        for (let i = 1; i < pts.numberOfItems; i++) {
          const a = pts.getItem(i - 1)
          const b = pts.getItem(i)
          len += Math.hypot(b.x - a.x, b.y - a.y)
        }
        return len
      }
      return 100
    } catch (e) {
      return 100
    }
  }

  if (!svg?.url) return null
  
  return (
    <div
      ref={containerRef}
      className={`enhanced-svg-container ${className || ''}`}    
    >
      <div className="icon-fill" />
    </div>
  )
}

export default EnhancedSVG