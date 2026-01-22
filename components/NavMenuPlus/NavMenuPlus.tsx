'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { scaleDown as Menu } from 'react-burger-menu'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import Image from 'next/image'
import TransitionLink from '@/components/TransitionLink/TransitionLink'

// Register GSAP plugins once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText)
}

export function NavMenuPlus({ className, logo, links, headerBar }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const splitRef = useRef<SplitText | null>(null)
  const animationRef = useRef<GSAPTween | null>(null)
  const ulRef = useRef<HTMLUListElement>(null)
  const pathname = usePathname()
  const [currentStatus, setCurrentStatus] = useState('')
  
  // Fixed useCallback implementation
  const animateNavStatus = useCallback(() => {
    console.log('Animating nav status:', currentStatus)
    
    if (!isOpen || !currentStatus) return

    const element = document.querySelector("#nav-status") as HTMLElement
    if (!element) {
      console.log('Nav status element not found')
      return
    }

    // Clean up previous animations first
    if (splitRef.current) {
      splitRef.current.revert()
      splitRef.current = null
    }
    if (animationRef.current) {
      animationRef.current.kill()
      animationRef.current = null
    }

    // Force update the text content
    element.textContent = currentStatus
    element.setAttribute('data-heading', currentStatus)

    // Create new SplitText with current content
    try {
      splitRef.current = new SplitText(element, { 
        type: "chars",
        charsClass: "char-item" 
      })
      
      // Animate if we have characters
      if (splitRef.current.chars && splitRef.current.chars.length > 0) {
        // Reset positions first
        gsap.set(splitRef.current.chars, { 
          x: 150, 
          opacity: 0 
        })
        
        // Animate in
        animationRef.current = gsap.to(splitRef.current.chars, {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power4.out",
          stagger: 0.04
        })
      }
    } catch (error) {
      console.error('Error animating nav status:', error)
    }
  }, [currentStatus, isOpen]) // Fixed: proper closing of useCallback

  // Fixed handleStateChange with useCallback
  const handleStateChange = useCallback((state: { isOpen: boolean }) => {
    console.log('Menu state changed:', state.isOpen)
    setIsOpen(state.isOpen)

    const statusBox = document.querySelector('.nav-status-box') as HTMLElement
    const headerBarElement = document.querySelector('.nav-header-bar') as HTMLElement

    if (statusBox) {
      statusBox.style.display = state.isOpen ? 'block' : 'none'
      
      if (headerBarElement) {
        headerBarElement.style.display = state.isOpen ? 'none' : 'block'
      }

      // Animate when opening
      if (state.isOpen) {
        console.log('Menu opening, current status:', currentStatus)
        requestAnimationFrame(() => {
          animateNavStatus()
        })
      } else {
        // Clean up when closing
        if (splitRef.current) {
          splitRef.current.revert()
          splitRef.current = null
        }
        if (animationRef.current) {
          animationRef.current.kill()
          animationRef.current = null
        }
      }
    }
  }, [animateNavStatus, currentStatus]) // Added dependencies

  // Compute status with useMemo
  const computeStatus = useMemo(() => {
    return () => {
      console.log('Computing status for pathname:', pathname)
      if (!pathname) return 'MCT630 | Main Page'
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length === 0) return 'MCT630 | Main Page'
      if (parts[0] === 'blog') {
        if (parts.length === 1) return 'MCT630 | Blog | Main Page'
        const slug = decodeURIComponent(parts[1]).replace(/[-_]/g, ' ')
        return `MCT630 | Blog | ${slug}`
      }
      const last = parts[parts.length - 1]
      const label = last.replace(/[-_]/g, ' ')
      return `MCT630 | ${label.charAt(0).toUpperCase() + label.slice(1)}`
    }
  }, [pathname])

  // Update current status
  useEffect(() => {
    const newStatus = computeStatus()
    console.log('Updating currentStatus to', newStatus)
    setCurrentStatus(newStatus)
  }, [computeStatus])

  // Normalize links with useMemo
  const normalizedLinks = useMemo(() => {
    if (!links || !Array.isArray(links)) return []
    const unwrap = (v: any): any => {
      try {
        if (v == null) return undefined
        if (typeof v === 'string') return v
        if (v.href) return v
        if (v.value) return unwrap(v.value)
        return v
      } catch (err) {
        return undefined
      }
    }

    return links.map((item: any) => {
      let base
      try {
        base = unwrap(item) || {}
      } catch (err) {
        base = {}
      }
      const label = base.label ?? (base.value?.label ?? (base?.props?.label ?? base?.label?.value))
      const linkRaw = base.link ?? base.value?.link ?? base?.props?.link ?? base.props?.props?.link
      const linkObj = unwrap(linkRaw) ?? {}
      const useTransition = base.useTransition ?? base.value?.useTransition ?? base.props?.useTransition ?? false
      return {
        label: label ?? String(base?.label ?? base?.text ?? 'Link'),
        link: {
          href: linkObj?.href ?? linkObj?.value ?? undefined,
          target: linkObj?.target ?? linkObj?.value?.target ?? undefined,
        },
        useTransition: !!(useTransition?.value ?? useTransition),
        animationType: base.animationType ?? base.value?.animationType ?? base.props?.animationType,
        transitionDuration: base.transitionDuration ?? base.value?.transitionDuration ?? base.props?.transitionDuration,
        rotationSpeed: base.rotationSpeed ?? base.value?.rotationSpeed ?? base.props?.rotationSpeed,
        zoomScale: base.zoomScale ?? base.value?.zoomScale ?? base.props?.zoomScale,
        animatedPathId: base.animatedPathId ?? base.value?.animatedPathId ?? base.props?.animatedPathId,
        gradientStart: base.gradientStart ?? base.value?.gradientStart ?? base.props?.gradientStart,
        gradientEnd: base.gradientEnd ?? base.value?.gradientEnd ?? base.props?.gradientEnd,
        strokeWidth: base.strokeWidth ?? base.value?.strokeWidth ?? base.props?.strokeWidth,
        splashImage: base.splashImage ?? base.value?.splashImage ?? base.props?.splashImage,
      }
    })
  }, [links])

  // Effect to trigger animation
  useEffect(() => {
    if (isOpen) {
      animateNavStatus()
    }
  }, [isOpen, animateNavStatus])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (splitRef.current) {
        splitRef.current.revert()
      }
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [])

  return (
    <nav className={`nav-container flex items-center justify-between w-full ${className ?? ''}`}>
      <div className="nav-status-box" style={{ display: 'none' }}>
        <span
          id="nav-status"
          className="nav-status-text"
          data-heading={currentStatus}
        >
          {currentStatus}
        </span>
      </div>
      {headerBar && <div className="nav-header-bar" style={{ display: 'block' }}>{headerBar}</div>}
      <Menu
        right
        width={225}
        isOpen={isOpen}
        onStateChange={handleStateChange}
        className="nav-menu-plus rounded-lg outline-double outline-2 outline-offset-2 border-double"
        burgerButtonClassName="bm-burger-button"
        burgerBarClassName="bm-burger-bars"
        crossButtonClassName="bm-cross-button"
        crossClassName="bm-cross"
        menuClassName="bm-menu"
        morphShapeClassName="bm-morph-shape"
        itemListClassName="bm-item-list"
        overlayClassName="none"
        pageWrapId="page-wrap"
        outerContainerId="outer-container"
      >
        {logo?.src && (
          <div className="logo-container">
            <Image
              src={logo.src}
              alt={logo.alt || 'Logo'}
              width={logo.width || 150}
              height={logo.height || 50}
              className={logo.className}
            />
          </div>
        )}
        <div>
          <ul className="bm-item-list" ref={ulRef}>
            {!normalizedLinks?.length ? (
              <li className="bm-item">n o * l i n k s</li>
            ) : (
              normalizedLinks.map((linkItem, index) => {
                if (!linkItem.link.href) return null;
                
                return (
                  <li key={index} className="bm-item" style={{ pointerEvents: 'auto' }}>
                    {linkItem.useTransition ? (
                      <TransitionLink
                        href={linkItem.link.href}
                        animationType={linkItem.animationType as any}
                        transitionDuration={linkItem.transitionDuration}
                        rotationSpeed={linkItem.rotationSpeed}
                        zoomScale={linkItem.zoomScale}
                        animatedPathId={linkItem.animatedPathId}
                        gradientStart={linkItem.gradientStart}
                        gradientEnd={linkItem.gradientEnd}
                        strokeWidth={linkItem.strokeWidth}
                        splashImage={linkItem.splashImage}
                      >
                        <span className="menu-item">{linkItem.label}</span>
                      </TransitionLink>
                    ) : (
                      <Link href={linkItem.link.href} target={linkItem.link.target} className="menu-item">
                        {linkItem.label}
                      </Link>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </Menu>
    </nav>
  )
}

export default NavMenuPlus