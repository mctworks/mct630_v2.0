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

// Update the component function signature
export function EnhancedSVG({
  className,
  svg,
  lightStrokeColor = '#000000',
  darkStrokeColor = '#ffffff',
  enableGradientDraw = false,
  gradientStartColor = '#000000',
  gradientEndColor = '#ffffff',
  gradientDuration = 2,
  resetDuration = 0.3, // DEFAULT VALUE
  logoStrokeWidth = 2,
  animatePaths = ['all'],
}: EnhancedSVGProps) {
  const { isDark } = useTheme()
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)
  const svgProcessedRef = useRef(false)

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

  // Enhanced color application function
  const applyColorToSVG = useCallback((svgEl: SVGElement, color: string) => {
    console.log('Applying color to SVG:', color)
    
    // Remove any existing filters
    const existingDefs = svgEl.querySelector('defs')
    if (existingDefs) {
      existingDefs.remove()
    }

    // Create new filter for coloring
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const filterId = 'colorize-' + Math.random().toString(36).substr(2, 9)
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.id = filterId
    filter.innerHTML = `
      <feFlood flood-color="${color}" result="flood"/>
      <feComposite in="flood" in2="SourceAlpha" operator="in" result="colored"/>
      <feBlend in="colored" in2="SourceGraphic" mode="multiply"/>
    `
    defs.appendChild(filter)
    svgEl.insertBefore(defs, svgEl.firstChild)

    // Apply to all elements with better detection
    const elements = svgEl.querySelectorAll('*')
    elements.forEach(el => {
      if (el.tagName.toLowerCase() === 'defs') return
      
      const tagName = el.tagName.toLowerCase()
      const originalFill = el.getAttribute('fill')
      const originalStroke = el.getAttribute('stroke')
      const style = el.getAttribute('style') || ''

      // Skip if element is currently animated
      if (el.hasAttribute('data-original-fill') || el.hasAttribute('data-original-stroke')) {
        return
      }

      // Enhanced detection for elements that should be colored
      const hasVisibleFill = (
        (originalFill && originalFill !== 'none' && originalFill !== 'transparent') ||
        (style.includes('fill:') && !style.includes('fill: none') && !style.includes('fill: transparent'))
      )

      const hasVisibleStroke = (
        (originalStroke && originalStroke !== 'none' && originalStroke !== 'transparent') ||
        (style.includes('stroke:') && !style.includes('stroke: none') && !style.includes('stroke: transparent'))
      )

      if (tagName === 'image') {
        el.setAttribute('filter', `url(#${filterId})`)
      } else {
        // Apply color to fills (rectangles, polygons, text, etc.)
        if (hasVisibleFill) {
          el.setAttribute('fill', color)
          // Type-safe style access
          const svgElement = el as SVGElement
          svgElement.style.setProperty('fill', color, 'important')
        }
        
        // Apply color to strokes
        if (hasVisibleStroke) {
          el.setAttribute('stroke', color)
          // Type-safe style access
          const svgElement = el as SVGElement
          svgElement.style.setProperty('stroke', color, 'important')
        }
      }
    })
  }, [])

  // Single effect to handle everything
  useEffect(() => {
    if (!svg?.url || !containerRef.current || svgProcessedRef.current) return

    console.log('🚀 Initializing EnhancedSVG...')

    fetch(svg.url)
      .then(res => res.text())
      .then(text => {
        if (!text.includes('<svg')) return
        
        setSvgContent(text)
        svgProcessedRef.current = true
        
        const wrapper = containerRef.current?.querySelector('.icon-fill')
        if (!wrapper) return
        
        // Inject SVG
        wrapper.innerHTML = text
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

  // Effect for theme changes
  useEffect(() => {
    if (!containerRef.current || !svgContent) return
    
    const svgEl = containerRef.current.querySelector('svg')
    if (svgEl) {
      console.log('🎨 Theme changed, updating color...', strokeColor)
      applyColorToSVG(svgEl, strokeColor)
    }
  }, [strokeColor, svgContent, applyColorToSVG])

  // Enhanced setupAnimation with text preservation
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
        // Exact match
        try {
          const exact = svgEl.querySelector(`#${CSS.escape(cleanId)}`)
          if (exact) {
            selected.push(exact)
            return
          }
        } catch (err) {
          // ignore
        }
        // Ends with match for IDs like foo-path-abc
        const ends = Array.from(svgEl.querySelectorAll('[id]')).filter(el => el.id.endsWith(`-${cleanId}`) || el.id.endsWith(`_${cleanId}`) || el.id === cleanId)
        if (ends.length > 0) {
          ends.forEach(el => selected.push(el))
          return
        }
        // Fallback include match
        const includes = Array.from(svgEl.querySelectorAll('[id]')).filter(el => el.id.includes(cleanId))
        if (includes.length > 0) {
          includes.forEach(el => selected.push(el))
          return
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
      
      // Store original values
      const originalFill = svgShape.getAttribute('fill') || ''
      const originalStroke = svgShape.getAttribute('stroke') || ''
      const originalStrokeWidth = svgShape.getAttribute('stroke-width') || ''
      
      svgShape.setAttribute('data-original-fill', originalFill)
      svgShape.setAttribute('data-original-stroke', originalStroke)
      svgShape.setAttribute('data-original-stroke-width', originalStrokeWidth)

      try {
        const length = getPathLength(svgShape)
        if (!length || length === 0) return

        // Setup stroke animation
        svgShape.style.strokeDasharray = `${length}`
        svgShape.style.strokeDashoffset = `${length}`
        svgShape.style.strokeWidth = `${logoStrokeWidth}px`
        svgShape.style.stroke = strokeColor
        
        // PRESERVE FILLS for text and other elements that need it
        // Only remove fill if it was originally none or empty
        if (originalFill === 'none' || !originalFill) {
          svgShape.style.fill = 'none'
        } else {
          // Keep the original fill for text and other filled elements
          svgShape.style.fill = originalFill
        }

        // Animation sequence:
        // 1. Draw with gradient start color
        tl.to(svgShape, {
          strokeDashoffset: 0,
          stroke: gradientStartColor,
          duration: gradientDuration * 0.4,
          ease: "power2.out"
        }, i * 0.4)

        // 2. Transition to gradient end color
        tl.to(svgShape, {
          stroke: gradientEndColor,
          duration: gradientDuration * 0.3,
          ease: "power1.inOut"
        }, `+=0.1`)

        // 3. Reset back to theme color with faster reset
         tl.to(svgShape, {
          strokeDashoffset: -length,
          stroke: strokeColor,
          duration: gradientDuration * resetDuration, // Use the resetDuration prop
          ease: "power2.in"
      }, `+=0.2`)

      } catch (error) {
        console.error(`Error animating element ${i}:`, error)
      }
    })

    animationRef.current = tl
    console.log('✅ Animation timeline created with current theme')
  }, [enableGradientDraw, gradientStartColor, gradientEndColor, gradientDuration, logoStrokeWidth, normalizedAnimatePaths, strokeColor])

  // Update animation on theme change
  useEffect(() => {
    if (!enableGradientDraw || !containerRef.current || !svgContent) return
    
    const svgEl = containerRef.current.querySelector('svg')
    if (svgEl && animationRef.current) {
      console.log('🎨 Updating animation with new theme color:', strokeColor)
      
      // Restart animation with new theme color
      setTimeout(() => {
        setupAnimation(svgEl)
      }, 100)
    }
  }, [strokeColor, enableGradientDraw, svgContent, setupAnimation])

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
        
        // Restore original styles but respect current theme
        if (originalFill !== null && originalFill !== '') {
          svgEl.style.fill = originalFill
        } else {
          svgEl.style.removeProperty('fill')
        }
        
        // For stroke, we want to use the current theme color, not the original
        svgEl.style.stroke = strokeColor
        
        if (originalStrokeWidth !== null && originalStrokeWidth !== '') {
          svgEl.style.strokeWidth = originalStrokeWidth
        } else {
          svgEl.style.removeProperty('stroke-width')
        }
        
        // Clean up temporary attributes
        svgEl.removeAttribute('data-original-fill')
        svgEl.removeAttribute('data-original-stroke')
        svgEl.removeAttribute('data-original-stroke-width')
        
        // Remove animation properties
        svgEl.style.removeProperty('stroke-dasharray')
        svgEl.style.removeProperty('stroke-dashoffset')
      })
    }
  }, [strokeColor])

  // Helper function to get path length
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
      return 100 // Default length for other shapes
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