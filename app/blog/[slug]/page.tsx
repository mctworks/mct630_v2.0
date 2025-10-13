import { notFound } from 'next/navigation'

import { getBlog, getAllBlogs } from '@/lib/contentful/fetchers'
import { formatBlog } from '@/lib/contentful/utils'
import { BlogPostContent } from '@/vibes/soul/sections/blog-post-content'
import { client } from '@/lib/contentful/client'
import { GetBlogsDocument } from '@/generated/contentful'

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map(blog => ({ slug: blog?.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug) {
    return notFound()
  }

  const blogData = await client.request(GetBlogsDocument, {
    filter: { slug },
  })

  if (!blogData.blogPostCollection) return notFound()
  const blog = await getBlog(slug)
  if (!blog) return notFound()

  const formattedBlog = formatBlog(blog)

  return <BlogPostContent blogPost={formattedBlog} />
}
