import { notFound } from 'next/navigation'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { MakeswiftProvider } from '@/lib/makeswift/provider'

import { getAllBlogs } from '@/lib/contentful/fetchers'
import { getBlog } from '@/lib/contentful/fetchers'
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

  // Try to resolve inline asset links for rich text so embedded images render
  try {
    const resolved = await getBlog(slug)
    if (resolved && blogData.blogPostCollection && blogData.blogPostCollection.items && blogData.blogPostCollection.items[0]) {
      // Merge any resolved body.links into the first item
      ;(blogData.blogPostCollection.items[0] as any).body = {
        ...(blogData.blogPostCollection.items[0] as any).body,
        ...(resolved.body || {}),
      }
    }
  } catch (err) {
    // ignore resolution errors - page should still render without inline links
    // eslint-disable-next-line no-console
    console.warn('Failed to resolve inline assets for blog body', err)
  }

  return (
    <MakeswiftProvider siteVersion={await getSiteVersion()}>
      <ContentfulProvider value={blogData.blogPostCollection as any}>
        <MakeswiftComponent
          snapshot={componentSnapshot}
          label="Blog Content with Slot"
          type={BLOG_CONTENT_WITH_SLOT_TYPE}
        />
      </ContentfulProvider>
    </MakeswiftProvider>
  )
}