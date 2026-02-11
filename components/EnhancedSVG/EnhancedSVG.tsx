'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@/components/ThemeConfig/ThemeConfig'
import { gsap } from 'gsap'

interface EnhancedSVGProps {
  className?: string
  svg?: { url: string; dimensions?: { width: number; height: number } }
  lightStrokeColor?: string
  darkStrokeColor?: string
  lightFillColor?: string
  darkFillColor?: string
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
  lightFillColor,
  darkFillColor,
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

  // Use stroke colors as fallback for fill colors if not provided
  const strokeColor = isDark ? darkStrokeColor : lightStrokeColor
  const fillColor = isDark 
    ? (darkFillColor || darkStrokeColor) 
    : (lightFillColor || lightStrokeColor)

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

  // FIXED: Properly recolor SVG with both stroke and fill colors
  const applyColorToSVG = useCallback((svgEl: SVGElement, stroke: string, fill: string) => {
    console.log('🎨 Applying colors to SVG - Stroke:', stroke, 'Fill:', fill)
    
    // Process all elements
    const elements = svgEl.querySelectorAll('*')
    elements.forEach(el => {
      if (el.tagName.toLowerCase() === 'defs') return
      
      const tagName = el.tagName.toLowerCase()
      
      // Skip elements that are currently being animated
      if (el.hasAttribute('data-original-stroke') || el.hasAttribute('data-original-fill')) {
        return
      }

      // Store original values if not already stored (for theme toggling)
      if (!el.hasAttribute('data-theme-original-stroke')) {
        const originalStroke = el.getAttribute('stroke')
        if (originalStroke) {
          el.setAttribute('data-theme-original-stroke', originalStroke)
        }
      }
      
      if (!el.hasAttribute('data-theme-original-fill')) {
        const originalFill = el.getAttribute('fill')
        if (originalFill) {
          el.setAttribute('data-theme-original-fill', originalFill)
        }
      }

      // Handle stroke colors
      const hasStrokeAttr = el.hasAttribute('stroke') && 
                           el.getAttribute('stroke') !== 'none' && 
                           el.getAttribute('stroke') !== 'transparent'
      
      const hasStrokeStyle = el.getAttribute('style')?.includes('stroke:') && 
                            !el.getAttribute('style')?.includes('stroke: none') &&
                            !el.getAttribute('style')?.includes('stroke: transparent')
      
      if (hasStrokeAttr || hasStrokeStyle) {
        el.setAttribute('stroke', stroke)
        const svgElement = el as SVGElement
        svgElement.style.setProperty('stroke', stroke, 'important')
      }

      // Handle fill colors - ALWAYS recolor fills unless they're gradients or explicitly 'none'
      const currentFill = el.getAttribute('fill') || ''
      const styleFill = el.getAttribute('style')?.match(/fill:\s*([^;]+)/)?.[1] || ''
      
      // Check if it's a gradient fill - preserve these
      const isGradientFill = currentFill.includes('url(') || styleFill.includes('url(')
      
      // Check if fill is explicitly set to 'none' or 'transparent'
      const isFillNone = currentFill === 'none' || 
                         currentFill === 'transparent' || 
                         styleFill === 'none' || 
                         styleFill === 'transparent'
      
      // Apply fill color to:
      // 1. Elements with fill attribute (except gradients and 'none')
      // 2. Elements with fill style (except gradients and 'none')
      // 3. Text elements (always recolor)
      // 4. Elements with black/white/currentColor fills
      if (!isGradientFill && !isFillNone) {
        // Always recolor if there's any fill attribute or if it's text
        if (el.hasAttribute('fill') || tagName === 'text' || hasFillStyle(el)) {
          el.setAttribute('fill', fill)
          const svgElement = el as SVGElement
          svgElement.style.setProperty('fill', fill, 'important')
        }
      }
      
      // Special handling for common color values
      const lowerFill = currentFill.toLowerCase()
      const lowerStyleFill = styleFill.toLowerCase()
      
      if (lowerFill === 'black' || lowerFill === '#000000' || 
          lowerStyleFill === 'black' || lowerStyleFill === '#000000' ||
          lowerFill === 'white' || lowerFill === '#ffffff' ||
          lowerStyleFill === 'white' || lowerStyleFill === '#ffffff' ||
          lowerFill === 'currentcolor' || lowerStyleFill === 'currentcolor') {
        if (!isGradientFill) {
          el.setAttribute('fill', fill)
          const svgElement = el as SVGElement
          svgElement.style.setProperty('fill', fill, 'important')
        }
      }
    })
    
    // Helper function to check if element has fill style
    function hasFillStyle(el: Element): boolean {
      const style = el.getAttribute('style')
      if (!style) return false
      return style.includes('fill:') && 
             !style.includes('fill: none') && 
             !style.includes('fill: transparent')
    }
    
    console.log('✅ SVG recoloring complete')
  }, [])

  // Reset SVG to original colors before animation
  const resetToThemeColors = useCallback((svgEl: SVGElement) => {
    if (!svgEl) return
    
    const elements = svgEl.querySelectorAll('*')
    elements.forEach(el => {
      // Restore stroke to theme color if it had a stroke originally
      if (el.hasAttribute('data-theme-original-stroke')) {
        const originalStroke = el.getAttribute('data-theme-original-stroke')
        if (originalStroke && originalStroke !== 'none' && originalStroke !== 'transparent') {
          el.setAttribute('stroke', strokeColor)
          const svgEl = el as SVGElement
          svgEl.style.setProperty('stroke', strokeColor, 'important')
        }
      }
      
      // Restore fill to theme color if it had a fill originally (and not gradient/none)
      if (el.hasAttribute('data-theme-original-fill')) {
        const originalFill = el.getAttribute('data-theme-original-fill')
        if (originalFill && 
            originalFill !== 'none' && 
            originalFill !== 'transparent' && 
            !originalFill.includes('url(')) {
          el.setAttribute('fill', fillColor)
          const svgEl = el as SVGElement
          svgEl.style.setProperty('fill', fillColor, 'important')
        }
      }
    })
  }, [strokeColor, fillColor])

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
        
        // Apply initial colors
        applyColorToSVG(svgEl, strokeColor, fillColor)
        
        // Setup animation if enabled
        if (enableGradientDraw) {
          console.log('🎬 Setting up animation...')
          setTimeout(() => setupAnimation(svgEl), 200)
        }
      })
      .catch(console.error)
  }, [svg?.url, enableGradientDraw, applyColorToSVG, strokeColor, fillColor])

  useEffect(() => {
    if (!containerRef.current || !svgContent) return
    
    const svgEl = containerRef.current.querySelector('svg')
    if (svgEl) {
      console.log('🎨 Theme changed, updating colors...', { strokeColor, fillColor })
      
      // If animation is active, stop it and reset
      if (animationRef.current) {
        cleanupAnimation(svgEl)
      }
      
      // Apply new theme colors
      applyColorToSVG(svgEl, strokeColor, fillColor)
      
      // Restart animation if enabled
      if (enableGradientDraw) {
        setTimeout(() => setupAnimation(svgEl), 100)
      }
    }
  }, [strokeColor, fillColor, svgContent, applyColorToSVG, enableGradientDraw])

  const setupAnimation = useCallback((svgEl: SVGElement) => {
    if (!enableGradientDraw || !svgEl) return
    
    console.log('🎬 Starting animation setup with theme color:', strokeColor)

    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill()
      animationRef.current = null
    }

    // Reset to theme colors first
    resetToThemeColors(svgEl)

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
      
      // Store original values for cleanup
      const originalFill = svgShape.getAttribute('fill') || ''
      const originalStroke = svgShape.getAttribute('stroke') || ''
      const originalStrokeWidth = svgShape.getAttribute('stroke-width') || ''
      
      svgShape.setAttribute('data-original-fill', originalFill)
      svgShape.setAttribute('data-original-stroke', originalStroke)
      svgShape.setAttribute('data-original-stroke-width', originalStrokeWidth)

      try {
        const length = getPathLength(svgShape)
        if (!length || length === 0) return

        // Set animation properties
        svgShape.style.strokeDasharray = `${length}`
        svgShape.style.strokeDashoffset = `${length}`
        svgShape.style.strokeWidth = `${logoStrokeWidth}px`
        svgShape.style.stroke = strokeColor
        
        // Preserve original fill behavior during animation
        if (originalFill === 'none' || !originalFill || originalFill.includes('url(')) {
          svgShape.style.fill = originalFill
        } else {
          svgShape.style.fill = fillColor
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
  }, [enableGradientDraw, gradientStartColor, gradientEndColor, gradientDuration, logoStrokeWidth, normalizedAnimatePaths, strokeColor, fillColor, resetDuration, resetToThemeColors])

  const cleanupAnimation = useCallback((svgEl: SVGElement | null) => {
    if (animationRef.current) {
      animationRef.current.kill()
      animationRef.current = null
    }

    if (svgEl) {
      const animatedElements = svgEl.querySelectorAll('[data-original-fill]')
      animatedElements.forEach(el => {
        const svgEl = el as SVGElement
        
        // Remove animation styles
        svgEl.style.removeProperty('stroke-dasharray')
        svgEl.style.removeProperty('stroke-dashoffset')
        
        // Restore to theme colors
        if (el.hasAttribute('data-theme-original-stroke')) {
          svgEl.style.stroke = strokeColor
          svgEl.setAttribute('stroke', strokeColor)
        }
        
        if (el.hasAttribute('data-theme-original-fill')) {
          const originalFill = el.getAttribute('data-theme-original-fill')
          if (originalFill && !originalFill.includes('url(') && originalFill !== 'none') {
            svgEl.style.fill = fillColor
            svgEl.setAttribute('fill', fillColor)
          }
        }
        
        // Remove data attributes
        svgEl.removeAttribute('data-original-fill')
        svgEl.removeAttribute('data-original-stroke')
        svgEl.removeAttribute('data-original-stroke-width')
      })
    }
  }, [strokeColor, fillColor])

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
          applyColorToSVG(svgEl, strokeColor, fillColor)
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
        applyColorToSVG(svgEl, strokeColor, fillColor)
        if (enableGradientDraw) setTimeout(() => setupAnimation(svgEl), 200)
      }
    } catch (err) {
      console.error('EnhancedSVG: ensureSVGInjected error', err)
    }
  }, [svg, svgContent, applyColorToSVG, enableGradientDraw, setupAnimation, strokeColor, fillColor])

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