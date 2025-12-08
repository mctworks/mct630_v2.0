'use client'

import Image from 'next/image'
import { clsx } from 'clsx'
import * as Skeleton from '@/vibes/soul/primitives/skeleton'
import { useBlogTransitions } from '@/components/BlogListTransitions'
import { TransitionLink } from '@/components/TransitionLink/TransitionLink'

export interface BlogPost {
  title: string
  author?: string | null
  content: string
  date: string
  image?: {
    src: string
    alt: string
  } | null
  href: string
}

export interface BlogPostCardProps extends BlogPost {
  className?: string
}

/**
 * Client-side wrapper for BlogPostCard that applies transitions
 * based on BlogListTransitions context.
 */
export function BlogPostCardClient({
  author,
  content,
  date,
  href,
  image,
  title,
  className,
}: BlogPostCardProps) {
  const transitions = useBlogTransitions()

  const cardContent = (
    <article
      className={clsx(
        'group @container relative w-full max-w-md font-(family-name:--blog-post-card-font-family,var(--font-family-body))',
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-(--blog-post-card-image-background,var(--contrast-100))">
        {image != null ? (
          <img
            alt={image.alt}
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
            src={image.src}
          />
        ) : (
          <div className="p-4 text-5xl leading-none font-bold tracking-tighter text-(--blog-post-card-empty-text,color-mix(in_oklab,var(--foreground)_15%,transparent))">
            {title}
          </div>
        )}
      </div>
      <h5 className="mt-4 text-lg leading-snug font-medium text-(--blog-post-card-title-text,var(--foreground))">
        {title}
      </h5>
      <p className="mt-1.5 line-clamp-3 text-sm font-normal text-(--blog-post-card-content-text,var(--contrast-400))">
        {content}
      </p>
      <div className="mt-3 text-sm text-(--blog-post-card-author-date-text,var(--foreground))">
        <time dateTime={date}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {author != null && (
          <>
            <span className="after:mx-2 after:content-['•']" />
            <span>{author}</span>
          </>
        )}
      </div>
    </article>
  )

  // If transitions are enabled, wrap with TransitionLink
  if (transitions?.enableTransitions) {
    return (
      <TransitionLink
        href={{ href }}
        animationType={transitions.animationType}
        rotationSpeed={transitions.rotationSpeed}
        zoomScale={transitions.zoomScale}
        transitionDuration={transitions.transitionDuration}
        gradientStart={transitions.gradientStart}
        gradientEnd={transitions.gradientEnd}
        splashScale={transitions.splashScale}
        animatedPathId={transitions.animatedPathId}
        strokeWidth={transitions.strokeWidth}
      >
        {cardContent}
      </TransitionLink>
    )
  }

  // Without transitions, just return a plain link
  return (
    <a href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {cardContent}
    </a>
  )
}
