import { notFound } from 'next/navigation'
import { Page as MakeswiftPage } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { client } from '@/lib/makeswift/client'
import '@/lib/makeswift/components'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { getAllBlogs } from '@/lib/contentful/fetchers'

export default async function Page({ 
  params 
}: { 
  params: Promise<{ path?: string[] }> 
}) {
  const path = '/' + ((await params)?.path ?? []).join('/')
  const snapshot = await client.getPageSnapshot(path, {
    siteVersion: getSiteVersion(),
  })
  
  if (snapshot == null) return notFound()

  // If this is the blog listing page, fetch blog posts and provide them to
  // Makeswift-rendered components that rely on `useContentfulData()`.
  if (path === '/blog') {
    const blogs = await getAllBlogs()
    return (
      <ContentfulProvider value={blogs}>
        <MakeswiftPage snapshot={snapshot} />
      </ContentfulProvider>
    )
  }

  return <MakeswiftPage snapshot={snapshot} />
}