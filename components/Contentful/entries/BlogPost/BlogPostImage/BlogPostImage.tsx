'use client'

import { useContentfulData } from '@/lib/contentful/provider'
import { ContentfulImage } from '../../../common/ContentfulImage'

export function BlogPostImage() {
  const { data: blogs } = useContentfulData()
  
  if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
    return null
  }
  
  const blog = blogs[0]
  const field = blog?.banner ? { data: blog.banner } : { error: 'No banner found' }
  
  return <ContentfulImage field={field} data-testid="blog_featured_image" />
}