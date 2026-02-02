// BlogContentWithSlot.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import EnhancedSVG from '@/components/EnhancedSVG/EnhancedSVG'
import { TransitionLink } from '@/components/TransitionLink/TransitionLink'
import { BlogPostImage } from '@/components/Contentful/entries/BlogPost/BlogPostImage'
import { BlogPostRichText } from '@/components/Contentful/entries/BlogPost/BlogPostRichText'
import { BlogPostText } from '@/components/Contentful/entries/BlogPost/BlogPostText'
import { SectionLayout } from '@/vibes/soul/sections/section-layout'
import { useEffect, useState } from 'react'
import { formatBlog } from '@/lib/contentful/utils'
import { getAllBlogs } from '@/lib/contentful/fetchers'

interface Props {
  className?: string
  title?: { style?: string }
  date?: { style?: string }
  author?: { style?: string }
  description?: { style?: string }
  body?: { style?: string }
  h1?: { style?: string }  
  h2?: { style?: string }  
  h3?: { style?: string }  
  h4?: { style?: string } 
  h5?: { style?: string }
  h6?: { style?: string }
  children: React.ReactNode
}

export default function BlogContentWithSlot({ 
  className,
  title,
  date,
  author,
  description,
  body,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  children 
}: Props) {
  const isEditor = typeof window !== 'undefined' && 
    (window.location.search.includes('makeswift') || 
     window.location.href.includes('makeswift'))
  
  useEffect(() => {
  // Force font loading if needed
  if (typeof document !== 'undefined') {
    // Check if Makeswift fonts are loaded
    const makeswiftFonts = document.querySelectorAll('link[href*="fonts"]')
    console.log('Makeswift fonts found:', makeswiftFonts.length)
    
  }
}, [])

  if (isEditor) {
    return (
      <div className={className}>
        {/* Blog banner placeholder - body.style is a CLASS NAME */}
        <div className={body?.style} style={{ 
          background: '#f0f0f0', 
          height: '200px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: '#888' }}>Blog Banner</span>
        </div>
        
        {/* Title with style - title.style is a CLASS NAME */}
        <div className={title?.style} style={{ 
          marginBottom: '10px'
        }}>
          Blog Post Title
        </div>
        
        {/* Date with style - date.style is a CLASS NAME */}
        <div className={date?.style} style={{ 
          color: '#666',
          marginBottom: '10px'
        }}>
          January 1, 2024
        </div>
        
        {/* Author with style - author.style is a CLASS NAME */}
        <div className={author?.style} style={{ 
          color: '#666', 
          marginBottom: '20px'
        }}>
          By Author Name
        </div>
        
        {/* Description with style - description.style is a CLASS NAME */}
        <div className={description?.style} style={{ 
          lineHeight: '1.6',
          marginBottom: '30px'
        }}>
          This is a preview of how your blog post will appear. 
          The actual content will load from Contentful on the live site.
        </div>
        
        {/* Body content placeholder - body.style is a CLASS NAME */}
        <div className={body?.style} style={{ 
          lineHeight: '1.8'
        }}>
          <p>Rich text content will appear here on the live site.</p>
          <p>You can style this area using the Body style controls.</p>
        </div>
        
        <SectionLayout>{children}</SectionLayout>
      </div>
    )
  }
  
  // LIVE SITE: Original logic
  const BlogContentLive = React.lazy(() => {
    return import('@/lib/contentful/provider').then(({ useContentfulData }) => {
      const LiveComponent = () => {
        const { data: blogs } = useContentfulData()
        const [pagination, setPagination] = useState<{ prev?: any; next?: any; newest?: any; isNewest: boolean }>({
          isNewest: false,
        })

        type IconCfg = {
          iconEnableGradientDraw: boolean
          iconGradientStartColor: string
          iconGradientEndColor: string
          iconGradientDuration: number
          iconResetDuration: number
          iconLogoStrokeWidth: number
          iconAnimatePaths: string
        }

        const [paginationIconCfg, setPaginationIconCfg] = useState<IconCfg>({
          iconEnableGradientDraw: true,
          iconGradientStartColor: '#6EB1FF',
          iconGradientEndColor: '#C94F8A',
          iconGradientDuration: 10,
          iconResetDuration: 0.1,
          iconLogoStrokeWidth: 6,
          iconAnimatePaths: 'arrow',
        })

        const [returnIconCfg, setReturnIconCfg] = useState<IconCfg>({
          iconEnableGradientDraw: true,
          iconGradientStartColor: '#6EB1FF',
          iconGradientEndColor: '#C94F8A',
          iconGradientDuration: 1.5,
          iconResetDuration: 0.1,
          iconLogoStrokeWidth: 6,
          iconAnimatePaths: 'frame, blog1, blog2, blog3, frame',
        })

        useEffect(() => {
          if (typeof window === 'undefined') return
          try {
            const raw = localStorage.getItem('blogTransitionsIconConfig')
            if (!raw) return
            const parsed = JSON.parse(raw)

            if (parsed && typeof parsed === 'object') {
              if (parsed.pagination && parsed.return) {
                setPaginationIconCfg({
                  iconEnableGradientDraw: parsed.pagination.iconEnableGradientDraw ?? paginationIconCfg.iconEnableGradientDraw,
                  iconGradientStartColor: parsed.pagination.iconGradientStartColor ?? paginationIconCfg.iconGradientStartColor,
                  iconGradientEndColor: parsed.pagination.iconGradientEndColor ?? paginationIconCfg.iconGradientEndColor,
                  iconGradientDuration: parsed.pagination.iconGradientDuration ?? paginationIconCfg.iconGradientDuration,
                  iconResetDuration: parsed.pagination.iconResetDuration ?? paginationIconCfg.iconResetDuration,
                  iconLogoStrokeWidth: parsed.pagination.iconLogoStrokeWidth ?? paginationIconCfg.iconLogoStrokeWidth,
                  iconAnimatePaths: parsed.pagination.iconAnimatePaths ?? paginationIconCfg.iconAnimatePaths,
                })
                setReturnIconCfg({
                  iconEnableGradientDraw: parsed.return.iconEnableGradientDraw ?? returnIconCfg.iconEnableGradientDraw,
                  iconGradientStartColor: parsed.return.iconGradientStartColor ?? returnIconCfg.iconGradientStartColor,
                  iconGradientEndColor: parsed.return.iconGradientEndColor ?? returnIconCfg.iconGradientEndColor,
                  iconGradientDuration: parsed.return.iconGradientDuration ?? returnIconCfg.iconGradientDuration,
                  iconResetDuration: parsed.return.iconResetDuration ?? returnIconCfg.iconResetDuration,
                  iconLogoStrokeWidth: parsed.return.iconLogoStrokeWidth ?? returnIconCfg.iconLogoStrokeWidth,
                  iconAnimatePaths: parsed.return.iconAnimatePaths ?? returnIconCfg.iconAnimatePaths,
                })
              } else {
                // old single config structure — apply to both groups for compatibility
                setPaginationIconCfg({
                  iconEnableGradientDraw: parsed.iconEnableGradientDraw ?? paginationIconCfg.iconEnableGradientDraw,
                  iconGradientStartColor: parsed.iconGradientStartColor ?? paginationIconCfg.iconGradientStartColor,
                  iconGradientEndColor: parsed.iconGradientEndColor ?? paginationIconCfg.iconGradientEndColor,
                  iconGradientDuration: parsed.iconGradientDuration ?? paginationIconCfg.iconGradientDuration,
                  iconResetDuration: parsed.iconResetDuration ?? paginationIconCfg.iconResetDuration,
                  iconLogoStrokeWidth: parsed.iconLogoStrokeWidth ?? paginationIconCfg.iconLogoStrokeWidth,
                  iconAnimatePaths: parsed.iconAnimatePaths ?? paginationIconCfg.iconAnimatePaths,
                })
                setReturnIconCfg({
                  iconEnableGradientDraw: parsed.iconEnableGradientDraw ?? returnIconCfg.iconEnableGradientDraw,
                  iconGradientStartColor: parsed.iconGradientStartColor ?? returnIconCfg.iconGradientStartColor,
                  iconGradientEndColor: parsed.iconGradientEndColor ?? returnIconCfg.iconGradientEndColor,
                  iconGradientDuration: parsed.iconGradientDuration ?? returnIconCfg.iconGradientDuration,
                  iconResetDuration: parsed.iconResetDuration ?? returnIconCfg.iconResetDuration,
                  iconLogoStrokeWidth: parsed.iconLogoStrokeWidth ?? returnIconCfg.iconLogoStrokeWidth,
                  iconAnimatePaths: parsed.iconAnimatePaths ?? returnIconCfg.iconAnimatePaths,
                })
              }
            }
          } catch (e) {
            // ignore
          }
        }, [])

        useEffect(() => {
          ;(async () => {
            if (!blogs || !Array.isArray(blogs) || blogs.length === 0) return
            try {
              const all = await getAllBlogs()
              const currentBlogId = blogs[0]?._id
              if (!currentBlogId) return
              const index = all.findIndex(b => b?._id === currentBlogId)
              if (index < 0) return
              const nextBlog = index > 0 ? all[index - 1] : null
              const prevBlog = index >= 0 && index < all.length - 1 ? all[index + 1] : null
              const newest = all.length > 0 ? all[0] : null
              const isNewest = currentBlogId === newest?._id
              setPagination({
                prev: prevBlog ? formatBlog(prevBlog) : undefined,
                next: nextBlog ? formatBlog(nextBlog) : undefined,
                newest: newest ? formatBlog(newest) : undefined,
                isNewest,
              })
            } catch (e) {
              // ignore
            }
          })()
        }, [blogs])
        
        if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
          return <div>No blog posts available</div>
        }
        
        const validBlogs = blogs.filter((blog): blog is NonNullable<typeof blog> => 
          blog != null && 
          blog.__typename === 'BlogPost' && 
          typeof blog._id === 'string'
        )
        
        if (validBlogs.length === 0) {
          return <div>No valid blog posts available</div>
        }
        
        const blog = validBlogs[0]
        
        console.log('BlogContentWithSlot - body.style:', body?.style)
        console.log('BlogContentWithSlot - h1.style:', h1?.style)
        // Log the banner payload to help diagnose missing banner images on live pages
        console.log('BlogContentWithSlot - banner object:', blog?.banner)

        return (
          <div className={className} id="blog-content">
            {/* Skip link for keyboard users */}
            <a href="#blog-content" className="focusable-skip-link">Skip to main content</a>
            <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
              <a href="/">Home</a> &gt;
              <a href="/blog">Blog</a> &gt;
              <span>{blog?.title || 'Blog Post'}</span>
            </div>
            
            <BlogPostImage fieldPath="banner" className={body?.style} />
            <BlogPostText fieldPath="title" className={title?.style} />
            <BlogPostText fieldPath="publishDate" className={date?.style} />
            <BlogPostText fieldPath="author" className={author?.style} />
            <BlogPostText fieldPath="description" className={description?.style} />
            <BlogPostRichText 
              fieldPath="body" 
              className={body?.style}
              bannerUrl={blog?.banner?.url ?? undefined}
              h1ClassName={h1?.style}
              h2ClassName={h2?.style}
              h3ClassName={h3?.style}
              h4ClassName={h4?.style}
              h5ClassName={h5?.style}
              h6ClassName={h6?.style}
            />
            
            {/* Pagination Navigation */}
            <nav className="mx-auto w-full max-w-4xl mt-8 space-y-6" aria-label="Blog post navigation">
              {/* Previous/Next row */}
              <div className="pagination-controls grid grid-cols-2 md:grid-cols-2">
                {/* Previous */}
                <div className="flex">
                  {pagination.prev ? (
                    <TransitionLink
                      href={{ href: pagination.prev.href ?? '#' }}
                      animationType="LogoSplash"
                      splashImage="/icons/MCT630_blog_icon.v.1.0.svg"
                      gradientStart={paginationIconCfg.iconGradientStartColor}
                      gradientEnd={paginationIconCfg.iconGradientEndColor}
                      splashScale={3}
                      animatedPathId="frame, blog1, blog2, blog3"
                      strokeWidth={paginationIconCfg.iconLogoStrokeWidth}
                      transitionDuration={1.2}
                      containerClassName="flex gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] rounded"
                      aria-label={`Previous blog: ${pagination.prev.title}`}
                    >
                      <EnhancedSVG
                        svg={{ url: '/icons/mct630-blog-previous.svg' }}
                        enableGradientDraw={paginationIconCfg.iconEnableGradientDraw}
                        gradientStartColor={paginationIconCfg.iconGradientStartColor}
                        gradientEndColor={paginationIconCfg.iconGradientEndColor}
                        gradientDuration={paginationIconCfg.iconGradientDuration}
                        resetDuration={paginationIconCfg.iconResetDuration}
                        logoStrokeWidth={paginationIconCfg.iconLogoStrokeWidth}
                        animatePaths={paginationIconCfg.iconAnimatePaths}
                        className="pagination-arrow transition-transform duration-300"
                      />
                      <div>
                        <div className="text-sm text-(--foreground,inherit)">Previous Post</div>
                        <div className="font-semibold">{pagination.prev.title}</div>
                      </div>
                      <span className="sr-only">Previous blog: {pagination.prev.title}</span>
                    </TransitionLink>
                  ) : (
                    <div className="text-sm text-(--foreground,inherit) opacity-50" aria-hidden>Previous Post</div>
                  )}
                </div>

                {/* Next */}
                <div className="flex gap-3 justify-end md:justify-end">
                  {pagination.next ? (
                    <TransitionLink
                      href={{ href: pagination.next.href ?? '#' }}
                      animationType="LogoSplash"
                      splashImage="/icons/MCT630_blog_icon.v.1.0.svg"
                      gradientStart={paginationIconCfg.iconGradientStartColor}
                      gradientEnd={paginationIconCfg.iconGradientEndColor}
                      splashScale={3}
                      animatedPathId="frame, blog1, blog2, blog3"
                      strokeWidth={paginationIconCfg.iconLogoStrokeWidth}
                      transitionDuration={1.2}
                      containerClassName="flex gap-3 justify-end md:justify-end focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] rounded"
                      aria-label={`Next blog: ${pagination.next.title}`}
                    >
                      
                      <EnhancedSVG
                        svg={{ url: '/icons/mct630-blog-next.svg' }}
                        enableGradientDraw={paginationIconCfg.iconEnableGradientDraw}
                        gradientStartColor={paginationIconCfg.iconGradientStartColor}
                        gradientEndColor={paginationIconCfg.iconGradientEndColor}
                        gradientDuration={paginationIconCfg.iconGradientDuration}
                        resetDuration={paginationIconCfg.iconResetDuration}
                        logoStrokeWidth={paginationIconCfg.iconLogoStrokeWidth}
                        animatePaths={paginationIconCfg.iconAnimatePaths}
                        className="pagination-arrow transition-transform duration-300 right-arrow"
                      />
                      <div className="text-right">
                        <div className="text-sm text-(--foreground,inherit)">Next Post</div>
                        <div className="font-semibold">{pagination.next.title}</div>
                      </div>
                      <span className="sr-only">Next blog post: {pagination.next.title}</span>
                    </TransitionLink>
                  ) : (
                    <div className="text-sm text-(--foreground,inherit) opacity-50" aria-hidden>Next Post</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch center-single-column">
                {/* Newest blog card - hidden if on newest post */}
                {!pagination.isNewest && pagination.newest && (
                  <TransitionLink
                    href={{ href: pagination.newest.href ?? '#' }}
                    animationType="ActraiserDrop"
                    rotationSpeed={60}
                    zoomScale={8}
                    transitionDuration={1}
                    containerClassName="w-full h-full"
                  >
                    <article className="group relative w-full h-full border rounded-lg p-4 flex flex-col gap-4 transition-transform duration-300 hover:scale-[1.02]">
                      {pagination.newest.image ? (
                        <Image
                          src={pagination.newest.image.src}
                          alt={pagination.newest.image.alt}
                          width={120}
                          height={80}
                          className="rounded-md object-cover"
                          style={{ width: 'auto', height: 'auto' }}
                        />
                      ) : (
                        <div className="w-28 h-20 rounded-md bg-(--contrast-100,var(--contrast-100))" />
                      )}
                      <div>
                        <div className="text-xs text-(--foreground,inherit)">Newest</div>
                        <div className="font-semibold">{pagination.newest.title}</div>
                      </div>
                    </article>
                  </TransitionLink>
                )}

                {/* Return to blog main */}
                <div className="flex gap-4 rounded-lg p-4 border justify-center">
                  <TransitionLink
                    href={{ href: '/blog' }}
                    animationType="LogoSplash"
                    splashImage="/icons/MCT630_blog_icon.v.1.0.svg"
                    gradientStart={returnIconCfg.iconGradientStartColor}
                    gradientEnd={returnIconCfg.iconGradientEndColor}
                    splashScale={3}
                    animatedPathId="frame, blog1, blog2, blog3"
                    strokeWidth={returnIconCfg.iconLogoStrokeWidth}
                    transitionDuration={1.2}
                    containerClassName="flex gap-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] rounded"
                    aria-label="Return to blog main page"
                  >
                    <div>
                      <EnhancedSVG
                        svg={{ url: '/icons/MCT630_blog_icon.v.1.0.svg' }}
                        enableGradientDraw={returnIconCfg.iconEnableGradientDraw}
                        gradientStartColor={returnIconCfg.iconGradientStartColor}
                        gradientEndColor={returnIconCfg.iconGradientEndColor}
                        gradientDuration={returnIconCfg.iconGradientDuration}
                        resetDuration={returnIconCfg.iconResetDuration}
                        logoStrokeWidth={returnIconCfg.iconLogoStrokeWidth}
                        animatePaths={returnIconCfg.iconAnimatePaths}
                        className="index-return-icon flex-shrink-0 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-(--foreground,inherit) opacity-70">Return to</div>
                      <div className="font-semibold text-(--foreground,inherit)">Blog</div>
                    </div>
                    <span className="sr-only">Return to blog main page</span>
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

  if (typeof document !== 'undefined') {
  const makeswiftStyles = document.querySelectorAll('style[data-makeswift]')
  console.log('Makeswift styles found:', makeswiftStyles.length)
}
  
  return (
    <React.Suspense fallback={<div className={className}>Loading blog...</div>}>
      <BlogContentLive />
    </React.Suspense>
  )
}