/*EnhancedSVG.tsx*/
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@/components/ThemeConfig/ThemeConfig'
import { gsap } from 'gsap'
import { debounce } from 'lodash'

interface EnhancedSVGProps {
  className?: string
  svg?: { url: string; dimensions?: { width: number; height: number } }
  lightStrokeColor?: string
  darkStrokeColor?: string
  enableGradientDraw?: boolean
  gradientStartColor?: string
  gradientEndColor?: string
  gradientDuration?: number
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
  logoStrokeWidth = 2,
  animatePaths = ['all'],
}: EnhancedSVGProps) {
  const { isDark } = useTheme()
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [availablePaths, setAvailablePaths] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)

  const strokeColor = isDark ? darkStrokeColor : lightStrokeColor

  const normalizedAnimatePaths = React.useMemo(() => {
    if (Array.isArray(animatePaths)) {
      return animatePaths
    }
    if (typeof animatePaths === 'string') {
      return animatePaths === 'all' ? ['all'] : animatePaths.split(',').map(p => p.trim()).filter(Boolean)
    }
    return ['all']
  }, [animatePaths])

  useEffect(() => {
    console.log('Theme changed:', { isDark, strokeColor })
  }, [isDark, strokeColor])

  // Extract available paths from SVG content
  useEffect(() => {
    if (!svgContent) return
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    const paths: string[] = []
    
    // Get all elements with IDs
    const elementsWithIds = doc.querySelectorAll('*[id]')
    elementsWithIds.forEach(el => {
      const id = el.getAttribute('id')
      if (id && !id.startsWith('__')) { // Filter out auto-generated IDs
        paths.push(id)
      }
    })
    
    setAvailablePaths(paths)
    console.log('Available paths:', paths)
  }, [svgContent])

  useEffect(() => {
    if (!svg?.url) return
    fetch(svg.url)
      .then(res => res.text())
      .then(text => {
        if (text.includes('<svg')) {
          setSvgContent(text)
        }
      })
      .catch(console.error)
  }, [svg?.url])

  const recolorShapesDebounced = useCallback(
    debounce((svgEl: SVGElement | null, color: string) => {
      if (!svgEl) return
      
      console.log('Recoloring SVG with color:', color)

      // Remove any existing filters
      const existingDefs = svgEl.querySelector('defs')
      if (existingDefs) {
        existingDefs.remove()
      }

      // Add new defs section
      const defs = svgEl.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svgEl.firstChild)
      const filterId = 'colorize-' + Math.random().toString(36).substr(2, 9)

      // Create new filter with flood and preserve opacity
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
      filter.id = filterId
      filter.setAttribute('color-interpolation-filters', 'sRGB')
      filter.innerHTML = `
        <feFlood flood-color="${color}" result="flood"/>
        <feComposite in="flood" in2="SourceAlpha" operator="in" result="colored-alpha"/>
        <feBlend mode="normal" in="colored-alpha" in2="SourceGraphic"/>`
      defs.appendChild(filter)

      // Handle each element appropriately
      const allElements = svgEl.querySelectorAll('*')
      allElements.forEach(el => {
        if (el === filter || el.tagName.toLowerCase() === 'defs') return

        const tagName = el.tagName.toLowerCase()

        // Get the original attributes
        const originalFill = el.getAttribute('fill')
        const originalStroke = el.getAttribute('stroke')
        const originalStyle = el.getAttribute('style')
        const computedStyle = window.getComputedStyle(el)
        
        // Check if the element was originally meant to have a fill or stroke
        const hadFill = originalFill !== 'none' && 
                       originalFill !== null && 
                       !originalStyle?.includes('fill: none') &&
                       computedStyle.fill !== 'none' &&
                       computedStyle.fillOpacity !== '0'
                       
        const hadStroke = originalStroke !== 'none' && 
                         originalStroke !== null && 
                         !originalStyle?.includes('stroke: none') &&
                         computedStyle.stroke !== 'none' &&
                         computedStyle.strokeOpacity !== '0'

        if (tagName === 'image') {
          // For images, force remove any existing filter and apply new one
          el.removeAttribute('filter');
          (el as SVGElement).style.removeProperty('filter');
          (el as SVGElement).style.setProperty('filter', `url(#${filterId})`, 'important')
        } else {
          if (hadFill || hadStroke) {
            if (hadFill) {
              el.removeAttribute('fill');
              (el as SVGElement).style.setProperty('fill', color, 'important')
            }
            if (hadStroke) {
              el.removeAttribute('stroke');
              (el as SVGElement).style.setProperty('stroke', color, 'important')
            }
          }
        }
      })
    }, 100),
    []
  )

  // Enhanced animation function
  const setupAnimation = useCallback((svgEl: SVGElement) => {
    if (!enableGradientDraw || !svgEl) return
    
    if (animationRef.current) {
      animationRef.current.kill()
    }

    let elementsToAnimate: Element[] = []
    
    if (normalizedAnimatePaths.includes('all')) {
      elementsToAnimate = Array.from(svgEl.querySelectorAll('path, line, polyline, polygon, circle, rect, ellipse'))
    } else {
      elementsToAnimate = normalizedAnimatePaths
        .map(id => svgEl.querySelector(`#${id}`))
        .filter(Boolean) as Element[]
    }

    if (elementsToAnimate.length === 0) return

    console.log(`Animating ${elementsToAnimate.length} elements:`, normalizedAnimatePaths)

    const tl = gsap.timeline({ 
      repeat: -1, 
      repeatDelay: 0.5,
      defaults: { ease: 'power2.inOut' }
    })

    elementsToAnimate.forEach((shape, i) => {
      const svgShape = shape as SVGElement
      const originalFill = svgShape.getAttribute('fill') || ''
      const originalStroke = svgShape.getAttribute('stroke') || ''
      const originalStrokeWidth = svgShape.getAttribute('stroke-width') || ''
      
      svgShape.setAttribute('data-original-fill', originalFill)
      svgShape.setAttribute('data-original-stroke', originalStroke)
      svgShape.setAttribute('data-original-stroke-width', originalStrokeWidth)

      try {
        const length = getPathLength(svgShape)
        if (!length || length === 0) return

        const hasStroke = originalStroke && originalStroke !== 'none'
        const hasFill = originalFill && originalFill !== 'none'
        
        if (hasStroke) {
          svgShape.style.setProperty('stroke-dasharray', `${length}`, 'important')
          svgShape.style.setProperty('stroke-dashoffset', `${length}`, 'important')
          svgShape.style.setProperty('stroke', gradientStartColor, 'important')
          svgShape.style.setProperty('stroke-width', `${logoStrokeWidth}`, 'important')
        }
        
        if (!hasFill && hasStroke) {
          svgShape.style.setProperty('fill', 'none', 'important')
        }

        tl.to(svgShape, {
          strokeDashoffset: 0,
          duration: gradientDuration * 0.6,
        }, i * 0.2)

        tl.to(svgShape, {
          stroke: gradientEndColor,
          duration: gradientDuration * 0.4,
        }, `+=${gradientDuration * 0.3}`)

        tl.to(svgShape, {
          strokeDashoffset: -length,
          duration: gradientDuration * 0.6,
        }, `+=${gradientDuration * 0.2}`)

        tl.to(svgShape, {
          stroke: gradientStartColor,
          duration: 0.1,
        })

      } catch (error) {
        console.error(`Error animating element ${i}:`, error)
      }
    })

    animationRef.current = tl
  }, [enableGradientDraw, gradientStartColor, gradientEndColor, gradientDuration, logoStrokeWidth, normalizedAnimatePaths])

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
        if (el instanceof SVGPolygonElement && pts.numberOfItems > 2) {
          const a = pts.getItem(pts.numberOfItems - 1)
          const b = pts.getItem(0)
          len += Math.hypot(b.x - a.x, b.y - a.y)
        }
        return len
      }
      if (el instanceof SVGCircleElement) {
        const r = parseFloat(el.getAttribute('r') || '0')
        return 2 * Math.PI * r
      }
      if (el instanceof SVGRectElement) {
        const w = parseFloat(el.getAttribute('width') || '0')
        const h = parseFloat(el.getAttribute('height') || '0')
        return 2 * (w + h)
      }
      if (el instanceof SVGEllipseElement) {
        const rx = parseFloat(el.getAttribute('rx') || '0')
        const ry = parseFloat(el.getAttribute('ry') || '0')
        return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
      }
    } catch (e) {
      console.error('Error calculating path length:', e)
      return 0
    }
    return 0
  }

  // Clean up animation
  const cleanupAnimation = useCallback((svgEl: SVGElement | null) => {
    if (animationRef.current) {
      animationRef.current.kill()
      animationRef.current = null
    }

    if (svgEl) {
      // Restore original styles
      const animatedElements = svgEl.querySelectorAll('[data-original-fill]')
      animatedElements.forEach(el => {
        const svgEl = el as SVGElement
        const originalFill = svgEl.getAttribute('data-original-fill')
        const originalStroke = svgEl.getAttribute('data-original-stroke')
        const originalStrokeWidth = svgEl.getAttribute('data-original-stroke-width')
        
        if (originalFill !== null) {
          svgEl.style.setProperty('fill', originalFill, 'important')
        }
        if (originalStroke !== null) {
          svgEl.style.setProperty('stroke', originalStroke, 'important')
        }
        if (originalStrokeWidth !== null) {
          svgEl.style.setProperty('stroke-width', originalStrokeWidth, 'important')
        }
        
        // Clean up temporary attributes
        svgEl.removeAttribute('data-original-fill')
        svgEl.removeAttribute('data-original-stroke')
        svgEl.removeAttribute('data-original-stroke-width')
        
        // Remove dash properties
        svgEl.style.removeProperty('stroke-dasharray')
        svgEl.style.removeProperty('stroke-dashoffset')
      })
    }
  }, [])

  // Main effect for SVG handling
useEffect(() => {
    if (!containerRef.current || !svgContent) return
    
    const wrapper = containerRef.current.querySelector('.icon-fill')
    if (wrapper) {
      let svgEl = wrapper.querySelector('svg')
      
      if (svgEl && wrapper.innerHTML.includes('svg')) {
        console.log('Recoloring existing SVG with:', strokeColor)
        recolorShapesDebounced(svgEl, strokeColor)
        
        if (enableGradientDraw) {
          setupAnimation(svgEl)
        } else {
          cleanupAnimation(svgEl)
        }
      } else {
        console.log('Injecting new SVG content')
        wrapper.innerHTML = svgContent
        svgEl = wrapper.querySelector('svg')
        if (svgEl) {
         
          
          recolorShapesDebounced(svgEl, strokeColor)
          
          if (enableGradientDraw) {
            setTimeout(() => setupAnimation(svgEl!), 100)
          }
        }
      }
    }

    return () => {
      recolorShapesDebounced.cancel()
      const svgEl = containerRef.current?.querySelector('svg')
      cleanupAnimation(svgEl || null)
      
      if (containerRef.current) {
        const svgEl = containerRef.current.querySelector('svg')
        if (svgEl) {
          const defs = svgEl.querySelector('defs')
          if (defs) defs.remove()
        }
      }
    }
  }, [svgContent, strokeColor, enableGradientDraw, recolorShapesDebounced, setupAnimation, cleanupAnimation])

  if (!svg?.url) return null
  
  return (
    <div
      ref={containerRef}
      className={`enhanced-svg-container ${className || ''}`}    
    >
      {svgContent && (
        <div
          className="icon-fill"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  )
}

export default EnhancedSVG