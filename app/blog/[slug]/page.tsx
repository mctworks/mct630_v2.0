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
  const all = await getAllBlogs()

  const formattedBlog = formatBlog(blog)

  // Determine pagination neighbors (all is sorted by publishDate desc)
  const index = all.findIndex(b => b?.slug === slug)
  const nextBlog = index > 0 ? all[index - 1] : null // newer
  const prevBlog = index >= 0 && index < all.length - 1 ? all[index + 1] : null // older
  const newest = all.length > 0 ? all[0] : null

  return (
    <BlogPostContent
      blogPost={formattedBlog}
      prevBlog={prevBlog ? formatBlog(prevBlog) : undefined}
      nextBlog={nextBlog ? formatBlog(nextBlog) : undefined}
      newest={newest ? formatBlog(newest) : undefined}
    />
  )
}
