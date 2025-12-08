/**
 * BlogPostCardWithTransitions
 *
 * This file documents how to integrate TransitionLink with BlogPostCard
 * for the blog post list. There are two approaches:
 *
 * APPROACH 1: Wrap at the BlogPostList level (recommended for editor control)
 * In vibes/soul/sections/blog-post-list/index.tsx, accept a prop for whether
 * to enable transitions, then conditionally wrap each card.
 *
 * APPROACH 2: Create a new variant component
 * Create a wrapper that combines BlogPostCard with TransitionLink and accepts
 * transition configuration props.
 *
 * Below is APPROACH 2 - a wrapper that can be used in Makeswift:
 */

import { clsx } from 'clsx'
import { TransitionLink } from '@/components/TransitionLink/TransitionLink'
import {
  BlogPostCard,
  type BlogPostCardProps,
} from '@/vibes/soul/primitives/blog-post-card'

export interface BlogPostCardWithTransitionsProps extends BlogPostCardProps {
  // Transition props
  animationType?: 'ActraiserDrop' | 'LogoSplash' | string
  enableTransition?: boolean
  rotationSpeed?: number
  zoomScale?: number
  transitionDuration?: number
}

/**
 * BlogPostCardWithTransitions wraps BlogPostCard with TransitionLink.
 * Use this when you want individual blog cards to have custom transition animations.
 *
 * Example in a blog list:
 * ```tsx
 * {blogPosts.map((post) => (
 *   <BlogPostCardWithTransitions
 *     key={post.href}
 *     {...post}
 *     enableTransition={enableTransitions}
 *     animationType={animationType}
 *   />
 * ))}
 * ```
 */
export function BlogPostCardWithTransitions({
  href,
  title,
  content,
  date,
  author,
  image,
  className,
  animationType = 'ActraiserDrop',
  enableTransition = true,
  rotationSpeed = 360,
  zoomScale = 2,
  transitionDuration = 1,
}: BlogPostCardWithTransitionsProps) {
  if (!enableTransition) {
    return (
      <BlogPostCard
        href={href}
        title={title}
        content={content}
        date={date}
        author={author}
        image={image}
        className={className}
      />
    )
  }

  return (
    <TransitionLink
      href={{ href }}
      animationType={animationType}
      rotationSpeed={rotationSpeed}
      zoomScale={zoomScale}
      transitionDuration={transitionDuration}
      containerClassName={clsx('group @container relative w-full max-w-md', className)}
    >
      <BlogPostCard
        href={href}
        title={title}
        content={content}
        date={date}
        author={author}
        image={image}
        className={className}
      />
    </TransitionLink>
  )
}

export default BlogPostCardWithTransitions
