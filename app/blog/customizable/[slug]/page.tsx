import { notFound } from 'next/navigation'

import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'

import { BLOG_POST_EMBEDDED_COMPONENT_ID } from '@/components/BlogPostCustomizable/BlogPost.makeswift'
import { GetBlogsDocument } from '@/generated/contentful'
import { client } from '@/lib/contentful/client'
import { getAllBlogs } from '@/lib/contentful/fetchers'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { client as MakeswiftClient } from '@/lib/makeswift/client'

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map(blog => ({ slug: blog?.slug }))
}



export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const navSnapshot = await MakeswiftClient.getComponentSnapshot(
    'global-nav-menu',
    { siteVersion: getSiteVersion() }
  )
  
  const { slug } = await params
  if (!slug) {
    return notFound()
  }

  const componentSnapshot = await MakeswiftClient.getComponentSnapshot(
    'blog-content-customizable', 
    {
      siteVersion: await getSiteVersion(),
    }
  )

  if (componentSnapshot == null) return notFound()

  const { blogPostCollection } = await client.request(GetBlogsDocument, {
    filter: { slug },
  })

  if (!blogPostCollection) return notFound()

  return (
    <>
    <MakeswiftComponent
      snapshot={navSnapshot}
      label="Nav Menu Plus"
      type="navigation"
    />
    <div className="page-content">
    <ContentfulProvider value={blogPostCollection}>
    
      <MakeswiftComponent
        snapshot={componentSnapshot}
        label="Blog Post Customizable"
        type={BLOG_POST_EMBEDDED_COMPONENT_ID}
      />
    </ContentfulProvider>
    </div>
    </>
  )
}
