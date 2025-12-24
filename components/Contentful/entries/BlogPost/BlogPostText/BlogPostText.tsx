'use client'

import { useContentfulData } from '@/lib/contentful/provider'
import { ContentfulText } from '../../../common/ContentfulText'

// Helper to extract text field from blog
function getFieldFromBlog(blog: any, fieldName: string) {
  if (!blog) return { error: 'No blog data' }
  
  const value = blog[fieldName]
  if (value === null || value === undefined) {
    return { error: `Field "${fieldName}" not found` }
  }
  
  return { data: value }
}

export function BlogPostText() {
  const { data: blogs } = useContentfulData()
  
  if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
    return null
  }
  
  const blog = blogs[0]
  
  // Determine which field to show based on context
  // You might want to make this configurable or create separate components
  const field = 
    getFieldFromBlog(blog, 'title') || 
    getFieldFromBlog(blog, 'description') || 
    getFieldFromBlog(blog, 'publishDate') || 
    getFieldFromBlog(blog, 'author') || 
    { error: 'No text field found' }
  
  return <ContentfulText field={field} />
}