'use client'

import React from 'react'
import Image from 'next/image'
import EnhancedSVG from '@/components/EnhancedSVG/EnhancedSVG'
import TransitionLink from '@/components/TransitionLink/TransitionLink'
import { PortfolioPieceImage } from '@/components/Contentful/entries/PortfolioPiece/PortfolioPieceImage'
import { PortfolioPieceRichText } from '@/components/Contentful/entries/PortfolioPiece/PortfolioPieceRichText'
import { PortfolioPieceText } from '@/components/Contentful/entries/PortfolioPiece/PortfolioPieceText'
import { SectionLayout } from '@/vibes/soul/sections/section-layout'
import { useEffect } from 'react'
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
  children?: React.ReactNode
}

export default function PortfolioContentWithSlot({
  className,
  title,
  description,
  body,
  h1,
  h2,
  h3,
  children,
}: Props) {
  const isEditor = typeof window !== 'undefined' && (
    window.location.search.includes('makeswift') || window.location.href.includes('makeswift')
  )

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const makeswiftFonts = document.querySelectorAll('link[href*="fonts"]')
      // no-op
    }
  }, [])

  if (isEditor) {
    return (
      <div className={className}>
        <div className={body?.style} style={{ background: '#f7f7f7', height: '200px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#888' }}>Project Banner</span>
        </div>
                        animatePaths={'frame, codeslash'}
        <div className={title?.style} style={{ marginBottom: '10px' }}>Project Name</div>
        <div className={description?.style} style={{ marginBottom: '20px' }}>Project description goes here.</div>

        <div className={body?.style} style={{ lineHeight: 1.8 }}>
          <p>Rich text content will appear here on the live site.</p>
        </div>

        <SectionLayout>{children}</SectionLayout>
      </div>
    )
  }

  // LIVE SITE
  const Live = React.lazy(() => {
    return import('@/lib/contentful/provider').then(({ useContentfulData }) => {
      const LiveComponent = function LiveComponent() {
        const { data: pieces } = useContentfulData()

        if (!pieces || !Array.isArray(pieces) || pieces.length === 0) {
          return <div>No portfolio projects available</div>
        }

        // useContentfulData is typed for the blog provider shape by default;
        // in this context we expect portfolio pieces. Narrow the runtime
        // values to the QueriedPortfolioPiece shape so TypeScript understands
        // the downstream properties like `name` and `banner`.
        const valid = (pieces as any[]).filter((p): p is QueriedPortfolioPiece =>
          p != null && p.__typename === 'PortfolioPiece' && typeof p._id === 'string'
        )
        if (valid.length === 0) return <div>No valid portfolio pieces available</div>

        const piece = valid[0]
        // Development-only runtime instrumentation: observe any changes to
        // the #portfolio-content element (style/hidden/aria-hidden).
        // This helps capture who/what is mutating its visibility at runtime.
        React.useEffect(() => {
          try {
            const isEditor = typeof window !== 'undefined' && (
              window.location.search.includes('makeswift') || window.location.href.includes('makeswift')
            )

            const el = typeof document !== 'undefined' ? document.getElementById('portfolio-content') : null
            if (!el) return

            const obs = new MutationObserver((mutations) => {
              for (const m of mutations) {
                // Log mutation and stack to help identify the caller
                // eslint-disable-next-line no-console
                console.warn('PortfolioContentWithSlot: mutation on #portfolio-content', m)
                // eslint-disable-next-line no-console
                console.trace('Trace for mutation on #portfolio-content')
              }
            })

            obs.observe(el, { attributes: true, attributeFilter: ['style', 'hidden', 'aria-hidden'], attributeOldValue: true })

            let restoredOnce = false
            const restoreVisibility = () => {
              try {
                const style = el.getAttribute('style') || ''
                const hidden = el.hasAttribute('hidden')
                const aria = el.getAttribute('aria-hidden')
                if (!hidden && aria !== 'true' && !/display:\s*none/.test(style)) return

                // Remove hidden attribute and restore aria
                if (hidden) el.removeAttribute('hidden')
                if (aria === 'true') el.setAttribute('aria-hidden', 'false')

                // Remove any inline display and assert visible with !important
                try { el.style.removeProperty('display') } catch (err) { /* noop */ }
                try { el.style.setProperty('display', 'block', 'important') } catch (err) { /* noop */ }

                if (!restoredOnce) {
                  // Log once to help debugging without spamming the console
                  // eslint-disable-next-line no-console
                  console.warn('PortfolioContentWithSlot: restored #portfolio-content visibility to prevent accidental hide')
                  // eslint-disable-next-line no-console
                  console.trace()
                  restoredOnce = true
                }
              } catch (err) {
                // noop
              }
            }

            const poll = setInterval(() => {
              restoreVisibility()
            }, 400)

            // No dev-only style interception in production code. The proactive
            // restore above will prevent accidental hides from making the page
            // unusable while remaining minimally invasive.

            return () => {
              obs.disconnect()
              clearInterval(poll)
              // restore any patched descriptors
              try {
                // nothing to restore (no global prototype patches applied)
              } catch (err) {
                // noop
              }
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('PortfolioContentWithSlot instrumentation error', err)
          }
        }, [])

        return (
          <div className={className} id="portfolio-content">
            <a href="#portfolio-content" className="focusable-skip-link">Skip to main content</a>

            <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
              <a href="/">MCT630</a> | <a href="/portfolio">Portfolio</a> | <span>{piece?.name || 'Project'}</span>
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

            <nav className="mx-auto w-full max-w-4xl mt-8 space-y-6" aria-label="Portfolio navigation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch center-single-column">
                {/* Left column intentionally left blank to preserve layout and centering */}
                <div />

                {/* Return to portfolio - mirror Blog layout */}
                <div className="flex gap-4 rounded-lg p-4 border justify-center">
                  <TransitionLink
                    href={{ href: '/portfolio' }}
                    animationType="LogoSplash"
                    splashImage="/icons/MCT630_portfolio_icon.v.1.0.svg"
                    gradientStart={'#6EB1FF'}
                    gradientEnd={'#C94F8A'}
                    splashScale={3}
                    animatedPathId={'frame, codeslash'}
                    strokeWidth={6}
                    transitionDuration={6}
                    containerClassName="flex gap-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] rounded"
                    aria-label="Return to portfolio main page"
                  >
                    <div>
                      <EnhancedSVG
                        svg={{ url: '/icons/MCT630_portfolio_icon.v.1.0.svg' }}
                        enableGradientDraw={true}
                        gradientStartColor={'#6EB1FF'}
                        gradientEndColor={'#C94F8A'}
                        gradientDuration={1.5}
                        resetDuration={0.1}
                        logoStrokeWidth={6}
                        animatePaths={'frame, codeslash'}
                        className="index-return-icon flex-shrink-0 transition-transform duration-300"
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

      return { default: LiveComponent }
    })
  })

  return <Live />
}


