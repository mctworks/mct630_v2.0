'use client'

import React, { Ref, forwardRef, useEffect, useRef, ReactNode, ReactElement } from 'react'
import Link from 'next/link'
import { scaleDown as Menu } from 'react-burger-menu'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import Image from 'next/image'

interface Props {
  className: string
  headerBar?: ReactNode
  logo?: {
    src: string      
    alt: string
    className: string
    width: number
    height: number
  } | null  // Add | null
  links?: Array<{
    label: string
    link: {
      href: string
      target?: '_blank' | '_self'
    }
  }> | null  // Add | null
}

export function NavMenuPlus({ className, logo, links, headerBar}: Props) {
  const [isOpen, setIsOpen] = React.useState(false)
  const splitRef = useRef<SplitText | null>(null)
  const animationRef = useRef<GSAPTween | null>(null)
  const ulRef = useRef<HTMLUListElement>(null) // Add this


  // Register GSAP plugins
  useEffect(() => {
    gsap.registerPlugin(SplitText);
  }, []);

  // Setup split text and handle window resize
  useEffect(() => {
    function setup() {
      // Cleanup previous instances
      if (splitRef.current) {
        splitRef.current.revert();
      }
      if (animationRef.current) {
        animationRef.current.kill();
      }

      const element = document.querySelector("#nav-status");
      if (element) {
        splitRef.current = new SplitText(element, { type: "chars" });
      }
    }

    setup();
    window.addEventListener("resize", setup);

    return () => {
      window.removeEventListener("resize", setup);
      if (splitRef.current) {
        splitRef.current.revert();
      }
      if (animationRef.current) {
        animationRef.current.kill();
      }
    }
  }, []);

  const handleStateChange = (state: { isOpen: boolean }) => {
    setIsOpen(state.isOpen);
    
    const statusBox = document.getElementsByClassName('nav-status-box')[0];
    const pageContent = document.getElementsByClassName('page-content')[0];
    const headerBar = document.getElementsByClassName('nav-header-bar')[0];

    if (statusBox) {
      statusBox.setAttribute('style', 
        state.isOpen ? 'display: block; transition: filter 0.5s ease;' 
                    : 'display: none; transition: filter 0.5s ease;'
      );

      headerBar?.setAttribute('style',
        state.isOpen ? 'display: none; transition: filter 0.2s ease;'
                    : 'display: block; transition: filter 0.2s ease;'
      );

      // Animate split text when menu opens
      if (state.isOpen && splitRef.current?.chars) {
        if (animationRef.current) {
          animationRef.current.kill();
        }
        
        animationRef.current = gsap.from(splitRef.current.chars, {
          x: 150,
          opacity: 0,
          duration: 0.7,
          ease: "power4",
          stagger: 0.04
        });
      }
    }
    
    if (pageContent) {
      pageContent.setAttribute('style',
        state.isOpen ? 'filter: blur(2px); transition: filter 0.5s ease;'
                    : 'filter: none; transition: filter 0.5s ease;'
      );
    }
  };

  return (
    <nav className={`nav-container flex items-center justify-between sticky top-0 z-50' : ''}`}>
      <div className="nav-status-box" style={{ display: 'none' }}>
        <span
          id="nav-status"
          className="nav-status-text"
          data-heading="MCT630 | page name | article title"
        >
          MCT630 | page name | article title
        </span>
      </div>
      {headerBar && <div className="nav-header-bar" style={{ display: 'block'}}>{headerBar}</div>}
      <Menu
        right
        noOverlay
        width={225}
        isOpen={isOpen}
        onStateChange={handleStateChange}
        className={`${className} nav-menu-plus rounded-lg outline-double outline-2 outline-offset-2 border-double fixed top-0 w-full`}
        burgerButtonClassName="bm-burger-button"
        burgerBarClassName="bm-burger-bars"
        crossButtonClassName="bm-cross-button"
        crossClassName="bm-cross"
        menuClassName="bm-menu"
        morphShapeClassName="bm-morph-shape"
        itemListClassName="bm-item-list"
        overlayClassName="bm-overlay"
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
            {!links?.length ? (
              <li className="bm-item">n o * l i n k s</li>
            ) : (
              links.map((linkItem, index) => (
                <li key={index} className="bm-item">
                  <Link href={linkItem.link.href} target={linkItem.link.target} className="menu-item">
                    {linkItem.label}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </Menu>
    </nav>
  )
}

export default NavMenuPlus