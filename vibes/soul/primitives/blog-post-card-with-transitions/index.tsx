/**
 * BlogPostCardWithTransitions
 *
 * NOTE: This primitive isn't currently in use. If you're pulling this project to play around with, you can disregard this file.
 * 
 * This file documents a Claude-generated attempt to integrate TransitionLink with BlogPostCard
 * for the blog post list. There are two approaches:
 *
 * APPROACH 1: Wrap at the BlogPostList level
 * In vibes/soul/sections/blog-post-list/index.tsx, accept a prop for whether
 * to enable transitions, then conditionally wrap each card. 
 * RESULT: Not functional in Makeswift due to limitations with conditional 
 * rendering and editor control. Still a viable approach for hard-coded implementations.
 *
 * APPROACH 2: Create a new variant component
 * Create a wrapper that combines BlogPostCard with TransitionLink and accepts
 * transition configuration props. 
 * RESULT: Untested as of now, and honestly I don't have a whole lot of faith in this solution. 
 * I may attempt to test this and refine this later if there's a strong demand for blog 
 * transition controls in Makeswift. I'm including the code here for reference.)
 *
 * Below is APPROACH 2:
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
 