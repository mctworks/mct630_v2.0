import { notFound } from 'next/navigation'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'

import { getAllBlogs } from '@/lib/contentful/fetchers'
import { client } from '@/lib/contentful/client'
import { GetBlogsDocument, GetBlogsQuery } from '@/generated/contentful'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { client as MakeswiftClient } from '@/lib/makeswift/client'
import { BLOG_CONTENT_WITH_SLOT_TYPE } from '@/components/BlogContentWithSlot/BlogContentWithSlot.makeswift'

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map(blog => ({ slug: blog?.slug })).filter(Boolean)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug) return notFound()

  const componentSnapshot = await MakeswiftClient.getComponentSnapshot(
    'blogContentWithSlot',
    { siteVersion: await getSiteVersion() }
  )

  if (componentSnapshot == null) {
    console.warn('BlogContentWithSlot component not found in Makeswift')
    return notFound()
  }

  // Use client.request to get the exact GraphQL type
  const blogData: GetBlogsQuery = await client.request(GetBlogsDocument, {
    filter: { slug },
  })

  if (!blogData.blogPostCollection) {
    console.warn(`Blog post not found for slug: ${slug}`)
    return notFound()
  }

  // Use the exact collection from the query (no type issues)
  return (
    <ContentfulProvider value={blogData.blogPostCollection}>
      <MakeswiftComponent
        snapshot={componentSnapshot}
        label="Blog Content with Slot"
        type={BLOG_CONTENT_WITH_SLOT_TYPE}
      />
    </ContentfulProvider>
  )
}