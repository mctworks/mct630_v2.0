'use client'

import { ReactNode, useContext, createContext } from 'react'

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
}

// Create context for blog transition settings
export const BlogTransitionsContext = createContext<BlogListTransitionsProps>({
  enableTransitions: true,
  animationType: 'ActraiserDrop',
  rotationSpeed: 90,
  zoomScale: 10,
  transitionDuration: 1.6,
  splashImage: undefined,
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
  }

  return (
  <BlogTransitionsContext.Provider value={contextValue}>
    <div style={{ display: 'contents' }}>
        {children}
      </div>
  </BlogTransitionsContext.Provider>
)
}

export default BlogListTransitions
