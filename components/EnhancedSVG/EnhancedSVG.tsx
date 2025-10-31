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
}: EnhancedSVGProps) {
  const { isDark } = useTheme()
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const strokeColor = isDark ? darkStrokeColor : lightStrokeColor
  
  // Log theme changes
  useEffect(() => {
    console.log('Theme changed:', { isDark, strokeColor, light: lightStrokeColor, dark: darkStrokeColor })
  }, [isDark, strokeColor, lightStrokeColor, darkStrokeColor])

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

  useEffect(() => {
    if (!containerRef.current || !svgContent || enableGradientDraw) return
    
    // Inject SVG content
    const wrapper = containerRef.current.querySelector('.icon-fill')
    if (wrapper) {
      const svgEl = wrapper.querySelector('svg')
      
      // If we have an SVG already, just recolor it
      if (svgEl && wrapper.innerHTML.includes('svg')) {
        console.log('Recoloring existing SVG with:', strokeColor)
        recolorShapesDebounced(svgEl, strokeColor)
      } else {
        // Otherwise inject new SVG content
        console.log('Injecting new SVG content')
        wrapper.innerHTML = svgContent
        const newSvgEl = wrapper.querySelector('svg')
        if (newSvgEl) {
          recolorShapesDebounced(newSvgEl, strokeColor)
        }
      }
    }

    return () => {
      recolorShapesDebounced.cancel()
      // Clean up any orphaned filters
      if (containerRef.current) {
        const svgEl = containerRef.current.querySelector('svg')
        if (svgEl) {
          const defs = svgEl.querySelector('defs')
          if (defs) defs.remove()
        }
      }
    }
  }, [svgContent, strokeColor, enableGradientDraw, recolorShapesDebounced])


  useEffect(() => {
    if (!enableGradientDraw || !containerRef.current || !svgContent) return
    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return

    const linePaths = svgEl.querySelectorAll('path, line, polyline, polygon, circle, rect, ellipse')
    if (linePaths.length === 0) return

    const getLength = (el: Element) => {
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
        return 0
      }
      return 0
    }

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.2 })

    linePaths.forEach((shape, i) => {
      const length = getLength(shape)
      if (!length || length === 0) return

      ;(shape as SVGElement).style.setProperty('stroke', gradientStartColor, 'important')
      ;(shape as SVGElement).style.setProperty('fill', 'none', 'important')
      ;(shape as SVGElement).style.setProperty('stroke-width', `${logoStrokeWidth}`, 'important')
      ;(shape as SVGElement).style.setProperty('stroke-dasharray', `${length}`, 'important')
      ;(shape as SVGElement).style.setProperty('stroke-dashoffset', `${length}`, 'important')

      tl.to(shape, {
        strokeDashoffset: 0,
        duration: gradientDuration,
        ease: 'power1.inOut',
      }, i * (gradientDuration * 0.15))

      tl.to(shape, {
        stroke: gradientEndColor,
        duration: gradientDuration * 0.5,
        ease: 'power1.inOut',
      }, i * (gradientDuration * 0.15))

      tl.to(shape, {
        strokeDashoffset: length,
        duration: gradientDuration,
        ease: 'power1.inOut',
      }, '+=0.1')
    })

    return () => { tl.kill() }
  }, [enableGradientDraw, svgContent, gradientStartColor, gradientEndColor, gradientDuration, logoStrokeWidth])

  if (!svg?.url) return null
  return (
  <div
        ref={containerRef}
        className={`enhanced-svg-container icon-fill ${className ?? ''}`}
        style={{
            display: 'inline-block',
            width: '100%', 
            height: 'auto', 
            '--svg-line-color': strokeColor,
        } as Record<string, string>}
    >
      {svgContent && (
        <div
          className="icon-fill"
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  )
}

export default EnhancedSVG