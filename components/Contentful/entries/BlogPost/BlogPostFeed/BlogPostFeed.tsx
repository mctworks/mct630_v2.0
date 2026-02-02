'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { GetBlogsQuery } from '@/generated/contentful'
import { useContentfulData } from '@/lib/contentful/provider'
import { getAllBlogs, QueriedBlogPost } from '@/lib/contentful/fetchers'
import TransitionLink from '@/components/TransitionLink/TransitionLink'

type Props = {
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  dateClassName?: string
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
  showViewMoreButton?: boolean
  viewMoreButtonClassName?: string
}

// Use QueriedBlogPost directly since that's what getAllBlogs returns
type BlogItem = QueriedBlogPost

export function BlogPostFeed({ 
  className, 
  itemsPerPage = 3,
  titleClassName,
  descriptionClassName,
  dateClassName,
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
  showViewMoreButton = true,
  viewMoreButtonClassName,
}: Props) {
  const { data: blogs } = useContentfulData()
  const [currentPage, setCurrentPage] = useState(1)
  const [fetchedBlogs, setFetchedBlogs] = useState<BlogItem[]>([])
  
  console.log('🔍 BlogPostFeed DEBUG:', {
    contextBlogs: blogs,
    contextIsArray: Array.isArray(blogs),
    contextLength: Array.isArray(blogs) ? blogs.length : 0,
    fetchedBlogsLength: fetchedBlogs.length
  })

  
  useEffect(() => {
    console.log('🔄 Checking data sources...')
    
    // 1. If context has data, use it (convert if needed)
    if (blogs && Array.isArray(blogs) && blogs.length > 0) {
      console.log('✅ Using context data:', blogs.length)
      // Convert to QueriedBlogPost if needed
      const converted = blogs.map(blog => blog as unknown as BlogItem)
      setFetchedBlogs(converted)
      return
    }
    
    // 2. If context is empty, fetch directly
    console.log('🔄 Context empty, fetching via getAllBlogs...')
    
    let mounted = true
    
    const fetchDirectly = async () => {
      try {
        const result = await getAllBlogs()
        console.log('getAllBlogs result:', result)
        
        if (mounted && Array.isArray(result)) {
          console.log('✅ Direct fetch successful:', result.length)
          setFetchedBlogs(result)
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error)
      }
    }
    
    fetchDirectly()
    
    return () => {
      mounted = false
    }
  }, [blogs]) // Only depends on blogs from context

  // Use fetchedBlogs (either from context or direct fetch)
  const effectiveBlogs = fetchedBlogs

  console.log('📊 Final effectiveBlogs:', {
    length: effectiveBlogs.length,
    firstTitle: effectiveBlogs[0]?.title
  })

  if (!effectiveBlogs || !Array.isArray(effectiveBlogs) || effectiveBlogs.length === 0) {
    return (
      <div className={clsx(className, 'flex items-center justify-center p-4 sm:p-6 md:p-8')}>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-600 sm:text-xl">No blog posts yet</h2>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">Check back soon for new content.</p>
        </div>
      </div>
    )
  }

  // EVERYTHING BELOW THIS POINT IS YOUR ORIGINAL WORKING CODE
  const blogPosts = effectiveBlogs
    .slice(0, currentPage * itemsPerPage)
    .filter((item): item is BlogItem => item !== null)

  const hasMore = blogPosts.length < effectiveBlogs.length

  const normalizedSplashImage = typeof splashImage === 'string' 
    ? splashImage 
    : splashImage && splashImage.url 
      ? { url: splashImage.url, dimensions: splashImage.dimensions || { width: 0, height: 0 } }
      : undefined

  // Calculate the number of items currently displayed
  const itemsDisplayed = Math.min(blogPosts.length, itemsPerPage)
  
  // Determine if we should use single column layout
  const shouldUseSingleColumn = itemsDisplayed === 1
  
  return (
    <div className={clsx(className, '@container space-y-12')} data-blogs-count={effectiveBlogs.length}>
      <div 
        className={clsx(
          "grid gap-8 center-single-column",
          shouldUseSingleColumn 
            ? "grid-cols-1" // Force single column when only 1 item
            : "grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-3" // Default responsive grid
        )}
        style={
          shouldUseSingleColumn 
            ? { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' } // Force explicit single column
            : undefined
        }
      >
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
    {/* FIXED: Makeswift styles take priority */}
<h3 className={clsx(
  titleClassName, // Makeswift styles only
  "line-clamp-2", // Keep for truncation
  "group-hover:text-blue-600" // Keep hover effect
  // REMOVED: text-xl font-bold text-gray-900
)}>
  {post?.title}
</h3>

<p className={clsx(
  descriptionClassName, // Makeswift styles only  
  "line-clamp-3" // Keep for truncation
  // REMOVED: text-gray-600
)}>
  {post?.description}
</p>
  </div>
  <div className="mt-4 flex items-center">
    {post?.publishDate && (
      <time 
        dateTime={post.publishDate}
        className={clsx(
          dateClassName
          // Optional: Add fallback styles if Makeswift doesn't set them
          // "text-sm text-gray-500"
        )}
      >
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

  {hasMore && showViewMoreButton && (
    <div className="flex justify-center">
      <button
        onClick={() => setCurrentPage(prev => prev + 1)}
        className={clsx(
          viewMoreButtonClassName, // Add this line
          "inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        )}
        aria-label="Load more blog posts"
      >
        View more posts
      </button>
    </div>
  )}
    </div>
  )
}