import { notFound } from 'next/navigation'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'

import { getAllBlogs } from '@/lib/contentful/fetchers'
import { client } from '@/lib/contentful/client'
import { GetBlogsDocument, GetBlogsQuery } from '@/generated/contentful'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { client as MakeswiftClient } from '@/lib/makeswift/client'
import { BLOG_POST_TEMPLATE_TYPE } from '@/components/BlogPostTemplate/BlogPostTemplate.makeswift'

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map(blog => ({ slug: blog?.slug })).filter(Boolean)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug) return notFound()

  const componentSnapshot = await MakeswiftClient.getComponentSnapshot(
    'blog-post-template',
    { siteVersion: await getSiteVersion() }
  )

  if (componentSnapshot == null) {
    console.warn('Create "blog-post-template" component in Makeswift dashboard')
    return notFound()
  }

  const blogData: GetBlogsQuery = await client.request(GetBlogsDocument, {
    filter: { slug },
  })

  // Extract the single blog post from the collection
  const blogPost = blogData.blogPostCollection?.items?.[0]
  
  if (!blogPost) return notFound()

  // Wrap the single blog post in the expected collection structure
  const collectionData = {
    __typename: 'BlogPostCollection' as const,
    total: 1,
    items: [blogPost],
  }

  // Pass the properly formatted collection
  return (
    <ContentfulProvider value={collectionData}>
      <MakeswiftComponent
        snapshot={componentSnapshot}
        label="Blog Post Template"
        type={BLOG_POST_TEMPLATE_TYPE}
      />
    </ContentfulProvider>
  )
}