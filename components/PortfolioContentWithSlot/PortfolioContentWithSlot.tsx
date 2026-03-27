'use client'

import React, { Suspense, useEffect, useState } from 'react'
import EnhancedSVG from '@/components/EnhancedSVG/EnhancedSVG'
import TransitionLink from '@/components/TransitionLink/TransitionLink'
import { PortfolioPieceImage } from '@/components/Contentful/entries/PortfolioPiece/PortfolioPieceImage'
import { PortfolioPieceRichText } from '@/components/Contentful/entries/PortfolioPiece/PortfolioPieceRichText'
import { PortfolioPieceText } from '@/components/Contentful/entries/PortfolioPiece/PortfolioPieceText'
import { SectionLayout } from '@/vibes/soul/sections/section-layout'
import { RelatedContent, parseSlugs } from '@/components/RelatedContent/RelatedContent'
import type { RelatedTransitionConfig } from '@/components/RelatedContent/RelatedContent'
import { useContentfulData } from '@/lib/contentful/provider'
import { QueriedPortfolioPiece } from '@/lib/contentful/fetchers'

interface Props {
  className?: string
  title?: { style?: string }
  description?: { style?: string }
  body?: { style?: string }
  h1?: { style?: string }
  h2?: { style?: string }
  h3?: { style?: string }
  returnIcon?: {
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
    animatePaths?: string
  }
  relatedSection?: {
    animationType?: string
    rotationSpeed?: number
    zoomScale?: number
    transitionDuration?: number
    gradientStart?: string
    gradientEnd?: string
    splashScale?: number
    animatedPathId?: string
    strokeWidth?: number
    splashImage?: string
  }
  children?: React.ReactNode
}

function LivePortfolioContent({
  className,
  title,
  description,
  body,
  h1,
  h2,
  h3,
  returnIcon,
  relatedSection,
  children,
}: Props) {
  const { data: pieces } = useContentfulData()

  const [iconConfig, setIconConfig] = useState({
    lightStrokeColor: '#000000',
    darkStrokeColor: '#ffffff',
    lightFillColor: '#000000',
    darkFillColor: '#ffffff',
    enableGradientDraw: true,
    gradientStartColor: '#6EB1FF',
    gradientEndColor: '#C94F8A',
    gradientDuration: 1.5,
    resetDuration: 0.1,
    logoStrokeWidth: 6,
    animatePaths: 'frame, codeslash',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('portfolioTransitionsIconConfig')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        setIconConfig(prev => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore
    }
  }, [])

  const mergedConfig = { ...iconConfig, ...(returnIcon || {}) }

  // ── Related content ─────────────────────────────────────────────────
  const valid = (pieces as any[] | null)?.filter(
    (p): p is QueriedPortfolioPiece =>
      p != null && p.__typename === 'PortfolioPiece' && typeof p._id === 'string'
  ) ?? []

  const piece = valid.length > 0 ? valid[0] : null

  const relatedBlogSlugs = parseSlugs(piece?.relatedBlogPosts)
  const relatedProjectSlugs = parseSlugs(piece?.relatedProjects)

  console.log('[PortfolioContentWithSlot] Related content:', {
    projectName: piece?.name,
    relatedBlogPostsRaw: piece?.relatedBlogPosts,
    relatedProjectsRaw: piece?.relatedProjects,
    parsedBlogSlugs: relatedBlogSlugs,
    parsedProjectSlugs: relatedProjectSlugs,
  })

  const relatedTransitionConfig: RelatedTransitionConfig = {
    animationType: relatedSection?.animationType ?? 'ActraiserDrop',
    rotationSpeed: relatedSection?.rotationSpeed ?? 60,
    zoomScale: relatedSection?.zoomScale ?? 8,
    transitionDuration: relatedSection?.transitionDuration ?? 1,
    gradientStart: relatedSection?.gradientStart ?? '#6EB1FF',
    gradientEnd: relatedSection?.gradientEnd ?? '#C94F8A',
    splashScale: relatedSection?.splashScale ?? 3,
    animatedPathId: relatedSection?.animatedPathId ?? 'all',
    strokeWidth: relatedSection?.strokeWidth ?? 3,
    splashImage: relatedSection?.splashImage ?? '',
  }

  console.log('🔍 LivePortfolioContent render:', {
    piecesCount: pieces?.length,
    firstPiece: (pieces as any[])?.[0]?.__typename,
  })

  if (!pieces || !Array.isArray(pieces) || pieces.length === 0) {
    console.warn('⚠️ No portfolio data available')
    return <div>No portfolio projects available</div>
  }

  if (valid.length === 0) return <div>No valid portfolio pieces available</div>

  return (
    <div className={className} id="portfolio-content" style={{ display: 'block' }}>
      <a href="#portfolio-content" className="focusable-skip-link">
        Skip to main content
      </a>

      <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
        <a href="/">MCT630</a> | <a href="/portfolio">Portfolio</a> |{' '}
        <span>{piece?.name || 'Project'}</span>
      </div>

      <PortfolioPieceImage fieldPath="banner" className={body?.style} />
      <PortfolioPieceText fieldPath="name" className={title?.style} />
      <PortfolioPieceText fieldPath="description" className={description?.style} />
      <PortfolioPieceRichText
        fieldPath="body"
        className={body?.style}
        bannerUrl={piece?.banner?.url ?? undefined}
        h1ClassName={h1?.style}
        h2ClassName={h2?.style}
        h3ClassName={h3?.style}
      />

      {/* ── Related Projects & Posts ─────────────────────────────────── */}
      {(relatedProjectSlugs.length > 0 || relatedBlogSlugs.length > 0) && (
        <RelatedContent
          blogSlugs={relatedBlogSlugs}
          projectSlugs={relatedProjectSlugs}
          transitionConfig={relatedTransitionConfig}
        />
      )}

      {/* ── Return to Portfolio ──────────────────────────────────────── */}
      <nav
        className="mx-auto w-full max-w-4xl mt-8 space-y-6"
        aria-label="Portfolio navigation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch center-single-column">
          <div />

          <div className="flex gap-4 rounded-lg p-4 border justify-center">
            <TransitionLink
              href={{ href: '/portfolio' }}
              animationType="LogoSplash"
              splashImage="/icons/MCT630_portfolio_icon.v.1.0.svg"
              gradientStart={mergedConfig.gradientStartColor}
              gradientEnd={mergedConfig.gradientEndColor}
              splashScale={3}
              animatedPathId={mergedConfig.animatePaths}
              strokeWidth={mergedConfig.logoStrokeWidth}
              transitionDuration={mergedConfig.gradientDuration}
              containerClassName="flex gap-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] rounded"
              aria-label="Return to portfolio main page"
            >
              <div>
                <EnhancedSVG
                  svg={{ url: '/icons/MCT630_portfolio_icon.v.1.0.svg' }}
                  lightStrokeColor={mergedConfig.lightStrokeColor}
                  darkStrokeColor={mergedConfig.darkStrokeColor}
                  lightFillColor={mergedConfig.lightFillColor}
                  darkFillColor={mergedConfig.darkFillColor}
                  enableGradientDraw={mergedConfig.enableGradientDraw}
                  gradientStartColor={mergedConfig.gradientStartColor}
                  gradientEndColor={mergedConfig.gradientEndColor}
                  gradientDuration={mergedConfig.gradientDuration}
                  resetDuration={mergedConfig.resetDuration}
                  logoStrokeWidth={mergedConfig.logoStrokeWidth}
                  animatePaths={mergedConfig.animatePaths}
                  className="flex-shrink-0 transition-transform duration-300"
                />
              </div>
              <div>
                <div className="text-sm opacity-70">Return to</div>
                <div className="font-semibold">Portfolio</div>
              </div>
              <span className="sr-only">Return to portfolio main page</span>
            </TransitionLink>
          </div>
        </div>
      </nav>

      <SectionLayout>{children}</SectionLayout>
    </div>
  )
}

export default function PortfolioContentWithSlot({
  className,
  title,
  description,
  body,
  h1,
  h2,
  h3,
  returnIcon,
  relatedSection,
  children,
}: Props) {
  const isEditor =
    typeof window !== 'undefined' &&
    (window.location.search.includes('makeswift') ||
      window.location.href.includes('makeswift'))

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.querySelectorAll('link[href*="fonts"]')
    }
  }, [])

  if (isEditor) {
    return (
      <div className={className}>
        <div
          className={body?.style}
          style={{
            background: '#f7f7f7',
            height: '200px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#888' }}>Project Banner</span>
        </div>
        <div className={title?.style} style={{ marginBottom: '10px' }}>
          Project Name
        </div>
        <div className={description?.style} style={{ marginBottom: '20px', fontStyle: 'italic' }}>
          Project description goes here.
        </div>
        <div className={body?.style} style={{ lineHeight: 1.8 }}>
          <p>Rich text content will appear here on the live site.</p>
        </div>

        {/* Related section preview */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f9f9f9',
            borderRadius: '8px',
            border: '1px dashed #ccc',
          }}
        >
          <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center' }}>
            Related Projects &amp; Blog Posts (live only)
          </p>
        </div>

        <SectionLayout>{children}</SectionLayout>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading portfolio content...</div>}>
      <LivePortfolioContent
        className={className}
        title={title}
        description={description}
        body={body}
        h1={h1}
        h2={h2}
        h3={h3}
        returnIcon={returnIcon}
        relatedSection={relatedSection}
      >
        {children}
      </LivePortfolioContent>
    </Suspense>
  )
}