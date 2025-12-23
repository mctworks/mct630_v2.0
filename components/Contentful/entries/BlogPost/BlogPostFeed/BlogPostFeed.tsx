'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { GetBlogsQuery } from '@/generated/contentful'
import { useContentfulData } from '@/lib/contentful/provider'
import TransitionLink from '@/components/TransitionLink/TransitionLink'

type Props = {
  className?: string
  itemsPerPage?: number
  // Transition settings
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

type BlogItem = NonNullable<GetBlogsQuery['blogPostCollection']>['items'][number]

export function BlogPostFeed({ 
  className, 
  itemsPerPage = 3,
  // Transition props with defaults
  enableTransitions = true,
  animationType = 'ActraiserDrop',
  rotationSpeed = 360,
  zoomScale = 2,
  transitionDuration = 1,
  gradientStart = '#00ffff',
  gradientEnd = '#ffd700',
  splashScale = 3,
  animatedPathId = 'all',
  strokeWidth = 3,
  splashImage,
}: Props) {
  const { data: blogs } = useContentfulData()
  const [currentPage, setCurrentPage] = useState(1)
  const [fetchedBlogs, setFetchedBlogs] = useState<typeof blogs | null>(null)

  // Debugging: log blog feed data when mounted/updated
  useEffect(() => {
    console.log('BlogPostFeed: received blogs', blogs)
  }, [blogs])

  // If context-provided blogs are missing, try the debug API fallback
  useEffect(() => {
    if (blogs && Array.isArray(blogs)) return
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/debug/blogs')
        if (!res.ok) return
        const json = await res.json()
        if (mounted && Array.isArray(json.blogs)) setFetchedBlogs(json.blogs)
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [blogs])

  const effectiveBlogs = Array.isArray(blogs) ? blogs : Array.isArray(fetchedBlogs) ? fetchedBlogs : null

  if (!effectiveBlogs || !Array.isArray(effectiveBlogs)) {
    return (
      <div className={clsx(className, 'flex items-center justify-center p-4 sm:p-6 md:p-8')}>
        <div className="text-center">
          <h2 className="text-lg font-bold text-red-600 sm:text-xl">Error loading blog posts</h2>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">Please try again later</p>
        </div>
      </div>
    )
  }

  const blogPosts = effectiveBlogs
    .slice(0, currentPage * itemsPerPage)
    .filter((item): item is BlogItem => item !== null)

  const hasMore = blogPosts.length < effectiveBlogs.length

  // Normalize splashImage to the format TransitionLink expects
  const normalizedSplashImage = typeof splashImage === 'string' 
    ? splashImage 
    : splashImage && splashImage.url 
      ? { url: splashImage.url, dimensions: splashImage.dimensions || { width: 0, height: 0 } }
      : undefined

  return (
    <div className={clsx(className, '@container space-y-12')} data-blogs-count={effectiveBlogs.length}>
      <div className="grid grid-cols-1 gap-8 @sm:grid-cols-2 @xl:grid-cols-3">
        {blogPosts.map(post => {
          const cardContent = (
            <>
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                {post?.banner?.url && post.banner.width && post.banner.height && (
                  <Image
                    alt={post.banner.description ?? `Hero image for blog post: ${post?.title}`}
                    src={post.banner.url}
                    width={post.banner.width}
                    height={post.banner.height}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex-1 space-y-3">
                  <h3 className="line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-blue-600">
                    {post?.title}
                  </h3>
                  <p className="line-clamp-3 text-gray-600">{post?.description}</p>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  {post?.publishDate && (
                    <time dateTime={post.publishDate}>
                      {new Date(post.publishDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  )}
                </div>
              </div>
            </>
          )

          const cardClasses = "group relative flex flex-col overflow-hidden rounded-lg card-background shadow-lg transition-all duration-300 hover:shadow-xl"

          // If transitions are enabled, wrap with TransitionLink
          if (enableTransitions) {
            return (
              <TransitionLink
                key={post?._id}
                href={{ href: `/blog/${post?.slug}` }}
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
                {cardContent}
              </TransitionLink>
            )
          }

          // Without transitions, use regular link
          return (
            <a
              key={post?._id}
              className={cardClasses}
              href={`/blog/${post?.slug}`}
              aria-label={`Read more about ${post?.title}`}
            >
              {cardContent}
            </a>
          )
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            aria-label="Load more blog posts"
          >
            View more posts
          </button>
        </div>
      )}
    </div>
  )
}