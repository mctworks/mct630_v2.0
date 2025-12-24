import { notFound } from 'next/navigation'
import { Page as MakeswiftPage } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { client } from '@/lib/makeswift/client'
import '@/lib/makeswift/components'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { getAllBlogs } from '@/lib/contentful/fetchers'

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const snapshot = await client.getPageSnapshot(path?.join('/') || '/', {
    siteVersion: await getSiteVersion(),
  })
  
  const blogs = await getAllBlogs()
  
  if (snapshot == null) return notFound()

  return (
    <ContentfulProvider value={blogs as any}> {/* ONLY CHANGE: add 'as any' */}
      <MakeswiftPage snapshot={snapshot} />
    </ContentfulProvider>
  )
}