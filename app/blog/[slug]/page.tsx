import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { MakeswiftProvider } from '@/lib/makeswift/provider'

import { getAllBlogs, getBlog } from '@/lib/contentful/fetchers'
import { client } from '@/lib/contentful/client'
import { GetBlogsDocument, GetBlogsQuery } from '@/generated/contentful'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { client as MakeswiftClient } from '@/lib/makeswift/client'
import { BLOG_CONTENT_WITH_SLOT_TYPE } from '@/components/BlogContentWithSlot/BlogContentWithSlot.makeswift'

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null
  return url.startsWith('//') ? `https:${url}` : url
}

async function buildBlogMetadata(slug?: string): Promise<Metadata> {
  const baseDesc =
    'Portfolio and Blog for Michael C. Thompson, a full-stack web developer specializing in front-end development based in the Atlanta area.'
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mct630.com')

  if (slug) {
    const blogPost = await getBlog(slug)
    if (blogPost?.title) {
      const title = `MCT630 | Blog | ${blogPost.title}`
      const description = typeof blogPost.description === 'string' && blogPost.description
        ? blogPost.description
        : baseDesc
      const imageUrl = normalizeUrl(blogPost.banner?.url) ?? '/mct630_og_card.jpeg'

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

  const componentSnapshot = await MakeswiftClient.getComponentSnapshot(
    'blogContentWithSlot',
    { siteVersion: await getSiteVersion() }
  )

  if (componentSnapshot == null) {
    console.warn('BlogContentWithSlot component not found in Makeswift')
    return notFound()
  }

  const blogData: GetBlogsQuery = await client.request(GetBlogsDocument, {
    filter: { slug },
  })

  if (!blogData.blogPostCollection) {
    console.warn(`Blog post not found for slug: ${slug}`)
    return notFound()
  }

  try {
    const resolved = await getBlog(slug)
    if (resolved && blogData.blogPostCollection?.items?.[0]) {
      ;(blogData.blogPostCollection.items[0] as any).body = {
        ...(blogData.blogPostCollection.items[0] as any).body,
        ...(resolved.body || {}),
      }
    }
  } catch (err) {
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