'use client'

import { useContentfulData } from '@/lib/contentful/provider'
import { ContentfulRichText } from '../../../common/ContentfulRichText/ContentfulRichText'

export function BlogPostRichText() {
  const { data: blogs } = useContentfulData()
  
  if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
    return null
  }
  
  const blog = blogs[0]
  const field = blog?.body ? { data: blog.body } : { error: 'No body content found' }
  
  return <ContentfulRichText field={field} />
}