'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { useContentfulData } from '@/lib/contentful/provider'
import { getAllPortfolioPieces, QueriedPortfolioPiece } from '@/lib/contentful/fetchers'
import TransitionLink from '@/components/TransitionLink/TransitionLink'

type Props = {
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  itemsPerPage?: number
  enableTransitions?: boolean
  animationType?: 'ActraiserDrop' | 'LogoSplash' | string
  rotationSpeed?: number
  zoomScale?: number
  transitionDuration?: number
  gradientStart?: string
  gradientEnd?: string
  splashScale?: number
  animatedPathId?: string
  strokeWidth?: number
  splashImage?: string | { url: string; dimensions?: { width: number; height: number } }
}

export function PortfolioPieceFeed({ 
  className, 
  itemsPerPage = 6,
  titleClassName,
  descriptionClassName,
  enableTransitions = true,
  animationType = 'ActraiserDrop',
  rotationSpeed = 30,
  zoomScale = 2,
  transitionDuration = 1,
  gradientStart = '#00ffff',
  gradientEnd = '#ffd700',
  splashScale = 3,
  animatedPathId = 'all',
  strokeWidth = 3,
  splashImage,
}: Props) {
  const { data } = useContentfulData()
  const [currentPage, setCurrentPage] = useState(1)
  const [pieces, setPieces] = useState<QueriedPortfolioPiece[]>([])

  const normalizedSplashImage = typeof splashImage === 'string'
    ? splashImage
    : splashImage && splashImage.url
      ? { url: splashImage.url, dimensions: splashImage.dimensions || { width: 0, height: 0 } }
      : undefined

  useEffect(() => {
    let mounted = true

    if (data && Array.isArray(data) && data.length > 0) {
      // try to extract portfolio pieces if present
      const extracted = (data as any[]).filter(d => d?.__typename === 'PortfolioPiece') as QueriedPortfolioPiece[]
      if (extracted.length > 0) {
        setPieces(extracted)
        return
      }
    }

    ;(async () => {
      try {
        const result = await getAllPortfolioPieces()
        if (mounted) setPieces(result)
      } catch (err) {
        console.error('Failed to fetch portfolio pieces:', err)
      }
    })()

    return () => { mounted = false }
  }, [data])

  if (!pieces || pieces.length === 0) {
    return (
      <div className={clsx(className, 'flex items-center justify-center p-4')}>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-600">No portfolio pieces yet</h2>
        </div>
      </div>
    )
  }

  // Separate active vs past
  const active = pieces.filter(p => p.recentProject === true)
  const past = pieces.filter(p => p.recentProject !== true)

  const renderCard = (piece: QueriedPortfolioPiece) => {
    const content = (
      <>
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {piece?.banner?.url && piece.banner.width && piece.banner.height && (
            <Image
              alt={piece.banner.description ?? `Project image: ${piece?.name}`}
              src={piece.banner.url}
              width={piece.banner.width}
              height={piece.banner.height}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex-1 space-y-3">
            <h3 className={clsx(titleClassName, 'line-clamp-2', 'font-semibold')}>{piece?.name}</h3>
            <p className={clsx(descriptionClassName, 'line-clamp-3', 'text-sm', 'text-gray-600',)}>{piece?.description}</p>
          </div>
        </div>
      </>
    )

    const cardClasses = "group relative flex flex-col overflow-hidden rounded-lg card-background shadow-lg transition-all duration-300 hover:shadow-xl mx-auto max-w-md md:max-w-none"

    if (enableTransitions) {
      return (
        <TransitionLink
          key={piece._id}
          href={{ href: `/portfolio/${piece?.slug}` }}
          containerClassName={cardClasses}
          animationType={animationType}
          rotationSpeed={rotationSpeed}
          zoomScale={zoomScale}
          transitionDuration={transitionDuration}
          gradientStart={gradientStart}
          gradientEnd={gradientEnd}
          splashScale={splashScale}
          animatedPathId={animatedPathId}
          strokeWidth={strokeWidth}
          splashImage={normalizedSplashImage}
        >
          {content}
        </TransitionLink>
      )
    }

    return (
      <a key={piece._id} className={cardClasses} href={`/portfolio/${piece?.slug}`} aria-label={`View project ${piece?.name}`}>
        {content}
      </a>
    )
  }

  return (
    <div className={clsx(className, '@container space-y-12')} data-pieces-count={pieces.length}>
      {active.length > 0 && (
        <section>
          <h2 className="text-2xl portfolio-h2 mb-4">Active Projects</h2>
          <div className="grid grid-cols-1 gap-8 @sm:grid-cols-2 @xl:grid-cols-3 center-single-column">
            {active.slice(0, currentPage * itemsPerPage).map(renderCard)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-2xl portfolio-h2mb-4">Past Projects</h2>
          <div className="grid grid-cols-1 gap-8 @sm:grid-cols-2 @xl:grid-cols-3 center-single-column">
            {past.slice(0, currentPage * itemsPerPage).map(renderCard)}
          </div>
        </section>
      )}

      {(active.length + past.length) > currentPage * itemsPerPage && (
        <div className="flex justify-center">
          <button onClick={() => setCurrentPage(prev => prev + 1)} className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700" aria-label="Load more portfolio pieces">Load more</button>
        </div>
      )}
      </div>
  )
}

