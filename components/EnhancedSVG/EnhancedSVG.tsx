'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeConfig/ThemeConfig'
import { gsap } from 'gsap'

interface EnhancedSVGProps {
  className?: string
  svg?: {
    url: string
    dimensions?: { width: number; height: number }
  }
  lightFillColor?: string
  darkFillColor?: string
  link?: {
    href: string
    target?: '_blank' | '_self'
  }
  transitionEffect?: 'none' | 'screentone-top' | 'screentone-bottom'
  transitionDuration?: number
  enableGradientDraw?: boolean
}

export default function EnhancedSVG({
  className,
  svg,
  lightFillColor = '#000000',
  darkFillColor = '#ffffff',
  link,
  transitionEffect = 'none',
  transitionDuration = 1.5,
  enableGradientDraw = false,
}: EnhancedSVGProps) {
  const router = useRouter()
  const { isDark, colors: themeColors } = useTheme()
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | HTMLAnchorElement>(null)

  const fillColor = isDark ? darkFillColor : lightFillColor
  const hasLink = link?.href && link.href.trim() !== ''

  // 1. Fetch and inject SVG
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

  // 2. Apply fill colors (when NOT using gradient draw)
  useEffect(() => {
    if (!containerRef.current || !svgContent || enableGradientDraw) return

    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return

    // Set SVG to fill container
    svgEl.style.width = '100%'
    svgEl.style.height = '100%'
    svgEl.style.display = 'block'

    // Apply fill to all paths and shapes
    const shapes = svgEl.querySelectorAll('path, circle, rect, polygon, ellipse, line, polyline')
    shapes.forEach(shape => {
      shape.setAttribute('fill', fillColor)
      shape.setAttribute('stroke', fillColor)
    })
  }, [svgContent, fillColor, enableGradientDraw])

  // 3. GSAP Gradient Draw Animation
  useEffect(() => {
    if (!enableGradientDraw || !containerRef.current || !svgContent) return

    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return

    // Set SVG to fill container
    svgEl.style.width = '100%'
    svgEl.style.height = '100%'
    svgEl.style.display = 'block'

    const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`
    
    // Create gradient definition
    const defs = svgEl.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    if (!svgEl.querySelector('defs')) {
      svgEl.insertBefore(defs, svgEl.firstChild)
    }

    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    gradient.setAttribute('id', gradientId)
    gradient.setAttribute('x1', '0%')
    gradient.setAttribute('y1', '0%')
    gradient.setAttribute('x2', '100%')
    gradient.setAttribute('y2', '0%')

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', fillColor)
    stop1.setAttribute('stop-opacity', '1')

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop2.setAttribute('offset', '100%')
    stop2.setAttribute('stop-color', fillColor)
    stop2.setAttribute('stop-opacity', '0')

    gradient.appendChild(stop1)
    gradient.appendChild(stop2)
    defs.appendChild(gradient)

    // Apply gradient to all shapes
    const shapes = svgEl.querySelectorAll('path, circle, rect, polygon, ellipse')
    shapes.forEach(shape => {
      shape.setAttribute('fill', `url(#${gradientId})`)
    })

    // Animate gradient
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.fromTo(
      [stop1, stop2],
      { attr: { offset: (i) => i === 0 ? '-50%' : '50%' } },
      { 
        attr: { offset: (i) => i === 0 ? '50%' : '150%' },
        duration: 2,
        ease: 'power1.inOut'
      }
    )

    return () => {
      tl.kill()
    }
  }, [enableGradientDraw, svgContent, fillColor])

  // 4. Screentone transition
  const handleClick = (e: React.MouseEvent) => {
    if (!hasLink) return
    if (transitionEffect === 'none') return

    e.preventDefault()

    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: ${themeColors.background};
      transform: scaleY(0);
      transform-origin: ${transitionEffect === 'screentone-top' ? 'top' : 'bottom'};
      z-index: 99999;
    `
    document.body.appendChild(overlay)

    gsap.to(overlay, {
      scaleY: 1,
      duration: transitionDuration,
      ease: 'power2.inOut',
      onComplete: () => {
        router.push(link!.href)
      },
    })
  }

  if (!svg?.url) return null

  const Tag = hasLink ? 'a' : 'div'

  return (
    <Tag
      ref={containerRef as any}
      className={`enhanced-svg-container icon-fill ${className ?? ''}`}
      style={{
        display: 'inline-block',
        width: svg.dimensions?.width ? `${svg.dimensions.width}px` : '100%',
        height: svg.dimensions?.height ? `${svg.dimensions.height}px` : 'auto',
        cursor: hasLink ? 'pointer' : 'default',
      }}
      {...(hasLink && {
        href: link.href,
        target: link.target,
        onClick: transitionEffect !== 'none' ? handleClick : undefined,
      })}
    >
      {svgContent && (
        <div 
          className="icon-fill"
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{ __html: svgContent }} 
        />
      )}
    </Tag>
  )
}