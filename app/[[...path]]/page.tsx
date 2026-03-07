import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Page as MakeswiftPage } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { client } from '@/lib/makeswift/client'
import '@/lib/makeswift/components'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { getAllBlogs, getBlog } from '@/lib/contentful/fetchers'
import { getAllPortfolioPieces, getPortfolioPiece } from '@/lib/contentful/fetchers'

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const { path } = await params
  const currentPath = path?.join('/') || '/'
  console.log('🔍 generateMetadata called for:', currentPath)
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mct630.com')

  const baseDescription =
    'Portfolio and Blog for Michael C. Thompson, a full-stack web developer specializing in front-end development based in the Atlanta area.'

  const baseMetadata: Metadata = {
    metadataBase,
    title: 'MCT630 | Michael C. Thompson | Full-Stack Web Developer',
    description: baseDescription,
    openGraph: {
      title: 'MCT630 | Michael C. Thompson',
      description: 'Blog & portfolio for Atlanta-based full-stack web developer specializing in front-end development and design.',
      images: [{ url: '/mct630_og_card.jpeg' }],
    },
    twitter: { card: 'summary_large_image' },
  }

  // Blog post page
  if (currentPath.startsWith('/blog/') && currentPath !== '/blog') {
    const slug = currentPath.replace('/blog/', '')
    console.log('🔍 blog slug metadata for', slug)
    if (slug !== '[slug]') {
      const blogPost = await getBlog(slug)
      console.log('🔍 blogPost result', {
        title: blogPost?.title,
        banner: blogPost?.banner?.url,
      })
      if (blogPost && blogPost.title) {
        const desc = blogPost.description ? String(blogPost.description) : baseDescription
        const imageUrl = blogPost.banner?.url || '/mct630_og_card.jpeg'
        console.log('🔍 constructing metadata for blog', { desc, imageUrl })
        return {
          metadataBase,
          title: `${blogPost.title} - MCT630`,
          description: desc,
          openGraph: {
            title: `${blogPost.title} - Michael C. Thompson | MCT630 : Blog`,
            description: desc,
            images: [{ url: imageUrl }],
          },
          twitter: { card: 'summary_large_image' },
        }
      }
    }
  }

  // Portfolio piece page
  if (currentPath.startsWith('/portfolio/') && currentPath !== '/portfolio') {
    const slug = currentPath.replace('/portfolio/', '')
    console.log('🔍 portfolio slug metadata for', slug)
    if (slug !== '[slug]') {
      const piece = await getPortfolioPiece(slug)
      console.log('🔍 portfolio piece result', {
        name: piece?.name,
        banner: piece?.banner?.url,
      })
      if (piece && piece.name) {
        const desc = piece.description ? String(piece.description) : baseDescription
        const imageUrl = piece.banner?.url || '/mct630_og_card.jpeg'
        console.log('🔍 constructing metadata for portfolio', { desc, imageUrl })
        return {
          metadataBase,
          title: `${piece.name} - MCT630`,
          description: desc,
          openGraph: {
            title: `${piece.name} - Michael C. Thompson | MCT630 : Portfolio`,
            description: desc,
            images: [{ url: imageUrl }],
          },
          twitter: { card: 'summary_large_image' },
        }
      }
    }
  }

  return baseMetadata
}

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const currentPath = path?.join('/') || '/'
  
  let contentfulData = null
  
  // Check if this is a blog post page
  const isBlogPostPage = currentPath.startsWith('/blog/') && currentPath !== '/blog'
  const isPortfolioPiecePage = currentPath.startsWith('/portfolio/') && currentPath !== '/portfolio'
  
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
  } else if (isPortfolioPiecePage) {
    const slug = currentPath.replace('/portfolio/', '')

    if (slug !== '[slug]') {
      const piece = await getPortfolioPiece(slug)
      if (piece) {
        contentfulData = {
          __typename: 'PortfolioPieceCollection' as const,
          total: 1,
          items: [piece],
        }
      }
    } else {
      const pieces = await getAllPortfolioPieces()
      contentfulData = pieces.length > 0 ? {
        __typename: 'PortfolioPieceCollection' as const,
        total: pieces.length,
        items: [pieces[0]],
      } : null
    }
  } else if (currentPath === '/portfolio') {
    const pieces = await getAllPortfolioPieces()
    contentfulData = {
      __typename: 'PortfolioPieceCollection' as const,
      total: pieces.length,
      items: pieces,
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