import { notFound } from 'next/navigation'
import { Page as MakeswiftPage } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { client } from '@/lib/makeswift/client'
import '@/lib/makeswift/components'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { getAllBlogs, getBlog } from '@/lib/contentful/fetchers'

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const currentPath = path?.join('/') || '/'
  
  let contentfulData = null
  
  // Check if this is a blog post page
  const isBlogPostPage = currentPath.startsWith('/blog/') && currentPath !== '/blog'
  
  if (isBlogPostPage) {
    // Extract slug from path (e.g., "/blog/my-post" → "my-post")
    const slug = currentPath.replace('/blog/', '')
    
    // Don't fetch if it's the template route "/blog/[slug]"
    if (slug !== '[slug]') {
      // Fetch the specific blog post
      const blogPost = await getBlog(slug)
      if (blogPost) {
        contentfulData = {
          __typename: 'BlogPostCollection' as const,
          total: 1,
          items: [blogPost],
        }
      }
    } else {
      // For "/blog/[slug]" template in editor, fetch all blogs or a preview
      const blogs = await getAllBlogs()
      contentfulData = blogs.length > 0 ? {
        __typename: 'BlogPostCollection' as const,
        total: blogs.length,
        items: [blogs[0]], // Use first blog as preview
      } : null
    }
  } else if (currentPath === '/blog') {
    // Blog index page - fetch all blogs
    const blogs = await getAllBlogs()
    contentfulData = {
      __typename: 'BlogPostCollection' as const,
      total: blogs.length,
      items: blogs,
    }
  }
  
  const snapshot = await client.getPageSnapshot(currentPath, {
    siteVersion: await getSiteVersion(),
  })
  
  if (snapshot == null) return notFound()

  return (
    <ContentfulProvider value={contentfulData as any}>
      <MakeswiftPage snapshot={snapshot} />
    </ContentfulProvider>
  )
}