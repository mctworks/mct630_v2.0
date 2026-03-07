import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'

import { BLOG_CONTENT_WITH_SLOT_TYPE } from '@/components/BlogContentWithSlot/BlogContentWithSlot.makeswift'
import { GetBlogsDocument } from '@/generated/contentful'
import { client } from '@/lib/contentful/client'
import { getAllBlogs, getBlog } from '@/lib/contentful/fetchers'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { client as MakeswiftClient } from '@/lib/makeswift/client'

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
  return blogs.map(blog => ({ slug: blog?.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug) {
    return notFound()
  }

  const componentSnapshot = await MakeswiftClient.getComponentSnapshot(
    `blog-content-with-slot-${slug}`,
    {
      siteVersion: await getSiteVersion(),
    }
  )

  if (componentSnapshot == null) return notFound()

  const blogData = await client.request(GetBlogsDocument, {
    filter: { slug },
  })

  if (!blogData.blogPostCollection) return notFound()

  return (
    <ContentfulProvider value={blogData.blogPostCollection?.items}>
      <MakeswiftComponent
        snapshot={componentSnapshot}
        label="Blog Content with Slot"
        type={BLOG_CONTENT_WITH_SLOT_TYPE}
      />
    </ContentfulProvider>
  )
}
