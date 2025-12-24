// components/BlogContentWithSlot.tsx
import React from 'react'

import { useContentfulData } from '@/lib/contentful/provider'
import { BlogPostImage } from '@/components/Contentful/entries/BlogPost/BlogPostImage'
import { BlogPostRichText } from '@/components/Contentful/entries/BlogPost/BlogPostRichText'
import { BlogPostText } from '@/components/Contentful/entries/BlogPost/BlogPostText'
import { SectionLayout } from '@/vibes/soul/sections/section-layout'

interface Props {
  children: React.ReactNode
}

export default function BlogContentWithSlot({ children }: Props) {
  const { data: blogs } = useContentfulData()
  
  if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
    return <div>No blog posts available</div>
  }

  // Filter out null/undefined and ensure it's a BlogPost
  const validBlogs = blogs.filter((blog): blog is NonNullable<typeof blog> => 
    blog != null && 
    blog.__typename === 'BlogPost' && 
    typeof blog._id === 'string'
  )
  
  if (validBlogs.length === 0) {
    console.error('No valid blogs found:', blogs)
    return <div>No valid blog posts available</div>
  }

  const blog = validBlogs[0]
  console.log('🚀 ~ BlogContentWithSlot ~ blog:', blog)

  // NO NEED FOR FORMATBLOG - entry components will fetch directly
  
  // Update field paths to access properties from the blog object
  return (
    <div>
      {/* Debug: Show what data we actually have */}
      <div style={{ display: 'none' }}>
        Debug: Blog keys - {Object.keys(blog).join(', ')}
      </div>
      
      {/* Breadcrumbs - simple implementation */}
      <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
        <a href="/">Home</a> &gt;
        <a href="/blog">Blog</a> &gt;
        <span>{blog?.title || 'Blog Post'}</span>
      </div>
      
      {/* Entry components with updated field paths */}
      {/* Remove "fieldPath" prop entirely - they'll read from context */}
      <BlogPostImage />
      <BlogPostText />
      <BlogPostRichText />
      
      {/* Slot for Makeswift-editable content */}
      <SectionLayout>{children}</SectionLayout>
    </div>
  )
}