"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { clsx } from 'clsx'

import { Stream, Streamable } from '@/vibes/soul/lib/streamable'
import Link from 'next/link'
import EnhancedSVG from '@/components/EnhancedSVG/EnhancedSVG'
import { TransitionLink } from '@/components/TransitionLink/TransitionLink'
import { ButtonLink } from '@/vibes/soul/primitives/button-link'
import * as Skeleton from '@/vibes/soul/primitives/skeleton'
import {
  type Breadcrumb,
  Breadcrumbs,
  BreadcrumbsSkeleton,
} from '@/vibes/soul/sections/breadcrumbs'
import { SectionLayout } from '@/vibes/soul/sections/section-layout'

interface Tag {
  label: string
  link: {
    href: string
    target?: string
  }
}

interface Image {
  src: string
  alt: string
}

export interface BlogPost {
  title: string
  author?: string | null
  date: string
  tags?: Tag[] | null
  content: string
  image?: Image | null
  href?: string
}

export interface BlogPostContentProps {
  blogPost: Streamable<BlogPost>
  breadcrumbs?: Streamable<Breadcrumb[]>
  className?: string
  prevBlog?: BlogPost
  nextBlog?: BlogPost
  newest?: BlogPost
}

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --blog-post-content-font-family: var(--font-family-body);
 *   --blog-post-content-title-font-family: var(--font-family-body);
 *   --blog-post-content-title: var(--foreground);
 *   --blog-post-content-image-background: var(--contrast-100);
 * }
 * ```
 */
export function BlogPostContent({
  blogPost: streamableBlogPost,
  className = '',
  breadcrumbs,
  prevBlog,
  nextBlog,
  newest,
}: BlogPostContentProps) {
  type IconCfg = {
    iconEnableGradientDraw: boolean
    iconGradientStartColor: string
    iconGradientEndColor: string
    iconGradientDuration: number
    iconResetDuration: number
    iconLogoStrokeWidth: number
    iconAnimatePaths: string
  }

  // Separate configs: pagination icons (prev/next) and return-to-blog icon
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

      // Backwards compatibility: if a flat config is stored, apply to pagination
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

  return (
    <SectionLayout className={clsx('group/blog-post-content', className)}>
      <div>
        <Stream fallback={<BlogPostContentSkeleton />} value={streamableBlogPost}>
          {blogPost => {
            const { title, author, date, tags, content, image } = blogPost

            return (
              <>
                <header className="mx-auto w-full max-w-4xl pb-8 font-[family-name:var(--blog-post-content-info-font-family,var(--font-family-body))] @2xl:pb-12 @4xl:pb-16">
                  {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
                  <h1 className="mt-8 mb-4 font-[family-name:var(--blog-post-content-title-font-family,var(--font-family-heading))] text-4xl leading-none font-medium text-(--blog-post-content-title,var(--foreground)) @xl:text-5xl @4xl:text-6xl">
                    {title}
                  </h1>
                  <p>
                    {date}{' '}
                    {author !== null && (
                      <>
                        <span className="px-1">•</span> {author}
                      </>
                    )}
                  </p>
                  {tags && tags.length > 0 && (
                    <div className="mt-4 -ml-1 flex flex-wrap gap-1.5 @xl:mt-6">
                      {tags.map(tag => (
                        <ButtonLink
                          href={tag.link.href}
                          key={tag.link.href}
                          size="small"
                          variant="tertiary"
                        >
                          {tag.label}
                        </ButtonLink>
                      ))}
                    </div>
                  )}
                </header>
                {image && (
                  <Image
                    alt={image.alt}
                    className="mb-8 aspect-video w-full rounded-2xl bg-(--blog-post-content-image-background,var(--contrast-100)) object-cover @2xl:mb-12 @4xl:mb-16"
                    height={780}
                    src={image.src}
                    width={1280}
                  />
                )}
                <article
                  className="prose mx-auto w-full max-w-4xl space-y-4"
                  dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Pagination controls */}
                <div className="mx-auto w-full max-w-4xl mt-8 space-y-6">
                  <div className="grid grid-cols-2 gap-3 items-center">
                    {/* Previous */}
                    <div className="flex flex-col items-center gap-3 self-baseline w-full">
                      {prevBlog ? (
                        <TransitionLink
                          href={{ href: prevBlog.href ?? '#' }}
                          animationType="LogoSplash"
                          splashImage= '/icons/MCT630_blog_icon.v.1.0.svg'
                          gradientStart={paginationIconCfg.iconGradientStartColor}
                          gradientEnd={paginationIconCfg.iconGradientEndColor}
                          splashScale={3}
                          animatedPathId="all"
                          strokeWidth={paginationIconCfg.iconLogoStrokeWidth}
                          transitionDuration={1.2}
                          containerClassName="w-full flex flex-col items-center gap-3 cursor-pointer transition-transform duration-300 hover:scale-105"
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
                            className="w-32 h-32 transition-transform duration-300 hover:scale-110"
                          />
                          <div className="text-center">
                            <div className="text-sm text-(--foreground,inherit)">Previous Blog Entry</div>
                            <div className="font-semibold text-(--foreground,inherit)">{prevBlog.title}</div>
                          </div>
                          <span className="sr-only">Previous blog: {prevBlog.title}</span>
                        </TransitionLink>
                      ) : (
                        <div className="text-sm text-(--foreground,inherit) opacity-50" aria-hidden>Previous Blog Entry</div>
                      )}
                    </div>

                    {/* Next */}
                    <div className="flex flex-col items-center gap-3 justify-end md:justify-end self-baseline w-full">
                      {nextBlog ? (
                        <TransitionLink
                          href={{ href: nextBlog.href ?? '#' }}
                          animationType="LogoSplash"
                          splashImage= '/icons/MCT630_blog_icon.v.1.0.svg'                           
                          gradientStart={paginationIconCfg.iconGradientStartColor}
                          gradientEnd={paginationIconCfg.iconGradientEndColor}
                          splashScale={3}
                          animatedPathId="all"
                          strokeWidth={paginationIconCfg.iconLogoStrokeWidth}
                          transitionDuration={1.2}
                          containerClassName="w-full flex flex-col items-center gap-3 cursor-pointer transition-transform duration-300 hover:scale-105"
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
                            className="w-32 h-32 transition-transform duration-300 hover:scale-110"
                          />
                          <div className="text-center">
                            <div className="text-sm text-(--foreground,inherit)">Next Blog Entry</div>
                            <div className="font-semibold text-(--foreground,inherit)">{nextBlog.title}</div>
                          </div>
                          <span className="sr-only">Next blog: {nextBlog.title}</span>
                        </TransitionLink>
                      ) : (
                        <div className="text-sm text-(--foreground,inherit) opacity-50" aria-hidden>Next Blog Entry</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {/* Newest blog card */}
                    <div className="relative">
                      {newest ? (
                        <TransitionLink
                          href={{ href: newest.href ?? '#' }}
                          animationType="ActraiserDrop"
                          rotationSpeed={90}
                          zoomScale={5}
                          transitionDuration={1}
                          containerClassName="w-full h-full"
                        >
                          <article className="group @container relative w-full h-full border rounded-lg overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-(--blog-post-card-image-background,var(--contrast-100))">
                              {newest.image ? (
                                <Image 
                                  src={newest.image.src} 
                                  alt={newest.image.alt} 
                                  fill
                                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110" 
                                />
                              ) : (
                                <div className="p-4 text-2xl leading-none font-bold tracking-tighter text-(--blog-post-card-empty-text,color-mix(in_oklab,var(--foreground)_15%,transparent))">
                                  {newest.title}
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <div className="text-xs text-(--foreground,inherit) uppercase tracking-wide mb-2">Newest</div>
                              <h5 className="text-base leading-snug font-medium text-(--blog-post-card-title-text,var(--foreground))">
                                {newest.title}
                              </h5>
                            </div>
                          </article>
                        </TransitionLink>
                      ) : (
                        <div className="border rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                          <div className="opacity-50 text-center">No newest blog post available</div>
                        </div>
                      )}
                    </div>

                    {/* Return to blog main */}
                    <TransitionLink
                      href={{ href: '/blog' }}
                      animationType="LogoSplash"
                      splashImage= '/icons/MCT630_blog_icon.v.1.0.svg'
                      gradientStart="#a6ff00ff"
                      gradientEnd="#aff3f3ff"
                      splashScale={3}
                      animatedPathId="all"
                      strokeWidth={3}
                      transitionDuration={1.2}
                      containerClassName="w-full h-full"
                    >
                      <div className="group flex items-center gap-4 rounded-lg p-4 border h-full transition-all duration-300 hover:border-(--color-primary,var(--primary)) hover:shadow-lg cursor-pointer">
                        <EnhancedSVG
                          svg={{ url: '/icons/MCT630_blog_icon.v.1.0.svg' }}
                          enableGradientDraw={returnIconCfg.iconEnableGradientDraw}
                          gradientStartColor={returnIconCfg.iconGradientStartColor}
                          gradientEndColor={returnIconCfg.iconGradientEndColor}
                          gradientDuration={returnIconCfg.iconGradientDuration}
                          resetDuration={returnIconCfg.iconResetDuration}
                          logoStrokeWidth={returnIconCfg.iconLogoStrokeWidth}
                          animatePaths={returnIconCfg.iconAnimatePaths}
                          className="w-24 h-24 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        />
                        <div>
                          <div className="text-sm text-(--foreground,inherit) opacity-70">Return to</div>
                          <div className="font-semibold text-(--foreground,inherit)">Blog index</div>
                        </div>
                        <span className="sr-only">Return to blog index page</span>
                      </div>
                    </TransitionLink>
                  </div>
                </div>
              </>
            )
          }}
        </Stream>
      </div>
    </SectionLayout>
  )
}

export function BlogPostContentSkeleton({ className }: Pick<BlogPostContentProps, 'className'>) {
  return (
    <Skeleton.Root
      className={clsx('group-has-[[data-pending]]/blog-post-content:animate-pulse', className)}
      pending
    >
      <div className="mx-auto w-full max-w-4xl pb-8 @2xl:pb-12 @4xl:pb-16">
        <BreadcrumbsSkeleton />
        <div className="mt-8 mb-4">
          <Skeleton.Text
            characterCount={60}
            className="rounded-lg text-4xl @xl:text-5xl @4xl:text-6xl"
          />
        </div>
        <div>
          <Skeleton.Box className="h-6 w-1/4 rounded-lg" />
        </div>
        <div className="mt-4 flex w-2/6 min-w-[250px] flex-wrap gap-3 @xl:mt-6">
          <Skeleton.Box className="h-10 w-16 rounded-full" />
          <Skeleton.Box className="h-10 w-14 rounded-full" />
          <Skeleton.Box className="h-10 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton.Box className="mb-8 aspect-video w-full rounded-2xl @2xl:mb-12 @4xl:mb-16" />
      <div className="mx-auto w-full max-w-4xl space-y-8 pb-8 text-xl @2xl:pb-12 @4xl:pb-16">
        <Skeleton.Text characterCount={60} className="rounded-lg" />
        <div className="space-y-4 text-lg">
          <Skeleton.Text characterCount="full" className="rounded-lg" />
          <Skeleton.Text characterCount="full" className="rounded-lg" />
          <Skeleton.Text characterCount="full" className="rounded-lg" />
          <Skeleton.Text characterCount="full" className="rounded-lg" />
          <Skeleton.Text characterCount="full" className="rounded-lg" />
          <Skeleton.Text characterCount="full" className="rounded-lg" />
          <Skeleton.Text characterCount={50} className="rounded-lg" />
        </div>
      </div>
    </Skeleton.Root>
  )
}