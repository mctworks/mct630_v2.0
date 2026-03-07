import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAllBlogs, getBlog } from '@/lib/contentful/fetchers'
import { formatBlog } from '@/lib/contentful/utils'
import { BlogPostContent } from '@/vibes/soul/sections/blog-post-content'

async function buildBlogMetadata(slug?: string): Promise<Metadata> {
  const baseDesc =
    'Portfolio and Blog for Michael C. Thompson, a full-stack web developer specializing in front-end development based in the Atlanta area.'
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mct630.com')

  if (slug) {
    const blogPost = await getBlog(slug)
    if (blogPost && blogPost.title) {
      const title = `${blogPost.title} - MCT630`
      const description = blogPost.description || baseDesc
      const imageUrl = blogPost.banner?.url || '/mct630_og_card.jpeg'

      return {
        metadataBase,
        title,
        description,
        openGraph: {
          title,
          description,
          images: [{ url: imageUrl }],
        },
        twitter: { card: 'summary_large_image' },
      }
    }
  }

  return {
    metadataBase,
    title: 'MCT630 | Michael C. Thompson | Full-Stack Web Developer',
    description: baseDesc,
    openGraph: { images: [{ url: '/mct630_og_card.jpeg' }] },
    twitter: { card: 'summary_large_image' },
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return buildBlogMetadata(slug)
}

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map(blog => ({ slug: blog?.slug })).filter(Boolean)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug) return notFound()

  const blog = await getBlog(slug)
  if (!blog) return notFound()

  const formattedBlog = formatBlog(blog)
  
  // NULL CHECK
  if (!formattedBlog) {
    console.error('Failed to format blog post:', blog.slug)
    return notFound() // Or show an error page
  }

  const breadcrumbs = [
    {
      id: '1',
      label: 'Home',
      href: '/',
    },
    {
      id: '2',
      label: 'Blog',
      href: '/blog',
    },
    {
      id: '3',
      label: formattedBlog.title, 
      href: '#',
    },
  ]
  
  return <BlogPostContent breadcrumbs={breadcrumbs} blogPost={formattedBlog} />
}