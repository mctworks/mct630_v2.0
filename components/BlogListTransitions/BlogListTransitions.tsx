'use client'

import { ReactNode, useContext, createContext, useEffect } from 'react'

/**
 * BlogListTransitions
 *
 * A wrapper component that provides transition animation configuration
 * to blog post cards via context. Configure in Makeswift and all child
 * cards will automatically use those settings. TODO: support other blog
 * page elements.
 */
export interface BlogListTransitionsProps {
  children?: ReactNode
  className?: string
  containerClassName?: string
  // Animation type: 'ActraiserDrop' | 'LogoSplash'
  animationType?: 'ActraiserDrop' | 'LogoSplash' | string
  // For ActraiserDrop animation
  rotationSpeed?: number
  zoomScale?: number
  transitionDuration?: number
  // LogoSplash settings
  gradientStart?: string
  gradientEnd?: string
  splashScale?: number
  splashImage?: string | { url: string; dimensions?: { width: number; height: number } }
  animatedPathId?: string
  strokeWidth?: number
  // Enable/disable transitions for the list
  enableTransitions?: boolean
  // Icon animation settings (for pagination icons)
  // Pagination icons (previous / next) animation settings
  paginationIconEnableGradientDraw?: boolean
  paginationIconGradientStartColor?: string
  paginationIconGradientEndColor?: string
  paginationIconGradientDuration?: number
  paginationIconResetDuration?: number
  paginationIconLogoStrokeWidth?: number
  paginationIconAnimatePaths?: string
  // Return-to-blog icon animation settings (separate override)
  returnIconEnableGradientDraw?: boolean
  returnIconGradientStartColor?: string
  returnIconGradientEndColor?: string
  returnIconGradientDuration?: number
  returnIconResetDuration?: number
  returnIconLogoStrokeWidth?: number
  returnIconAnimatePaths?: string
}

// Create context for blog transition settings
export const BlogTransitionsContext = createContext<BlogListTransitionsProps>({
  enableTransitions: true,
  animationType: 'ActraiserDrop',
  rotationSpeed: 90,
  zoomScale: 10,
  transitionDuration: 1.6,
  splashImage: undefined,
  // pagination defaults mirror previous icon defaults
  paginationIconEnableGradientDraw: false,
  paginationIconGradientStartColor: '#00ffff',
  paginationIconGradientEndColor: '#ffd700',
  paginationIconGradientDuration: 1.2,
  paginationIconResetDuration: 0.3,
  paginationIconLogoStrokeWidth: 2,
  paginationIconAnimatePaths: 'all',
  // return-to-blog defaults
  returnIconEnableGradientDraw: false,
  returnIconGradientStartColor: '#00ffff',
  returnIconGradientEndColor: '#ffd700',
  returnIconGradientDuration: 1.2,
  returnIconResetDuration: 0.3,
  returnIconLogoStrokeWidth: 2,
  returnIconAnimatePaths: 'all',
})

export function useBlogTransitions() {
  return useContext(BlogTransitionsContext)
}

/**
 * BlogListTransitions wraps the blog list and provides transition settings
 * to all child cards via context.
 */
export function BlogListTransitions({
  children,
  className,
  containerClassName,
  animationType,
  rotationSpeed,
  zoomScale,
  transitionDuration,
  gradientStart,
  gradientEnd,
  splashScale,
  animatedPathId,
  strokeWidth,
  splashImage,
  enableTransitions = true,
  // Pagination Icon SVG (Prev./Next arrows) props
  paginationIconEnableGradientDraw = true,
  paginationIconGradientStartColor = '#00ffff',
  paginationIconGradientEndColor = '#ffd700',
  paginationIconGradientDuration = 1.2,
  paginationIconResetDuration = 0.3,
  paginationIconLogoStrokeWidth = 2,
  paginationIconAnimatePaths = 'arrow',
  // return-to-blog SVG (Blog icon) props
  returnIconEnableGradientDraw = true,
  returnIconGradientStartColor = '#00ffff',
  returnIconGradientEndColor = '#ffd700',
  returnIconGradientDuration = 1.2,
  returnIconResetDuration = 0.3,
  returnIconLogoStrokeWidth = 2,
  returnIconAnimatePaths = 'all',
}: BlogListTransitionsProps) {
  const contextValue: BlogListTransitionsProps = {
    enableTransitions,
    animationType: animationType ?? 'ActraiserDrop',
    rotationSpeed: rotationSpeed ?? 360,
    zoomScale: zoomScale ?? 2,
    transitionDuration: transitionDuration ?? 1,
    gradientStart: gradientStart ?? '#00ffff',
    gradientEnd: gradientEnd ?? '#ffd700',
    splashScale: splashScale ?? 3,
    animatedPathId: animatedPathId ?? 'all',
    strokeWidth: strokeWidth ?? 3,
    splashImage,
      // Pagination icon animation defaults (previous / next)
      paginationIconEnableGradientDraw: (typeof (window as any) !== 'undefined' && (window as any).__BLOG_TRANSITIONS_ICON_CONFIG__?.pagination?.iconEnableGradientDraw) ?? paginationIconEnableGradientDraw,
      paginationIconGradientStartColor: paginationIconGradientStartColor ?? '#00ffff',
      paginationIconGradientEndColor: paginationIconGradientEndColor,
      paginationIconGradientDuration: paginationIconGradientDuration,
      paginationIconResetDuration: paginationIconResetDuration,
      paginationIconLogoStrokeWidth: paginationIconLogoStrokeWidth,
      paginationIconAnimatePaths: paginationIconAnimatePaths,
      // Blog icon (Return to Blog) animation defaults
      returnIconEnableGradientDraw: (typeof (window as any) !== 'undefined' && (window as any).__BLOG_TRANSITIONS_ICON_CONFIG__?.return?.iconEnableGradientDraw) ?? returnIconEnableGradientDraw,
      returnIconGradientStartColor: returnIconGradientStartColor ?? '#00ffff',
      returnIconGradientEndColor: returnIconGradientEndColor,
      returnIconGradientDuration: returnIconGradientDuration,
      returnIconResetDuration: returnIconResetDuration,
      returnIconLogoStrokeWidth: returnIconLogoStrokeWidth,
      returnIconAnimatePaths: returnIconAnimatePaths,
  }

    // Persist icon animation config so non-wrapped pages (single blog posts)
    // can pick up the settings (Makeswift editor updates this component on the blog page).
    useEffect(() => {
      if (typeof window === 'undefined') return
      try {
        const cfg = {
          pagination: {
            iconEnableGradientDraw: paginationIconEnableGradientDraw,
            iconGradientStartColor: paginationIconGradientStartColor,
            iconGradientEndColor: paginationIconGradientEndColor,
            iconGradientDuration: paginationIconGradientDuration,
            iconResetDuration: paginationIconResetDuration,
            iconLogoStrokeWidth: paginationIconLogoStrokeWidth,
            iconAnimatePaths: paginationIconAnimatePaths,
          },
          return: {
            iconEnableGradientDraw: returnIconEnableGradientDraw,
            iconGradientStartColor: returnIconGradientStartColor,
            iconGradientEndColor: returnIconGradientEndColor,
            iconGradientDuration: returnIconGradientDuration,
            iconResetDuration: returnIconResetDuration,
            iconLogoStrokeWidth: returnIconLogoStrokeWidth,
            iconAnimatePaths: returnIconAnimatePaths,
          },
        }
        localStorage.setItem('blogTransitionsIconConfig', JSON.stringify(cfg))
      } catch (e) {
        // ignore
      }
    }, [
      paginationIconEnableGradientDraw,
      paginationIconGradientStartColor,
      paginationIconGradientEndColor,
      paginationIconGradientDuration,
      paginationIconResetDuration,
      paginationIconLogoStrokeWidth,
      paginationIconAnimatePaths,
      returnIconEnableGradientDraw,
      returnIconGradientStartColor,
      returnIconGradientEndColor,
      returnIconGradientDuration,
      returnIconResetDuration,
      returnIconLogoStrokeWidth,
      returnIconAnimatePaths,
    ])

  return (
  <BlogTransitionsContext.Provider value={contextValue}>
    <div style={{ display: 'contents' }}>
        {children}
      </div>
  </BlogTransitionsContext.Provider>
)
}

export default BlogListTransitions
