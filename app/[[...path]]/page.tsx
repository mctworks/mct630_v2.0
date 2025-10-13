import { notFound } from 'next/navigation'
import { Page as MakeswiftPage, MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { client } from '@/lib/makeswift/client'

export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const path = '/' + ((await params)?.path ?? []).join('/')
  const snapshot = await client.getPageSnapshot(path, {
    siteVersion: getSiteVersion(),
  })

  const navSnapshot = await client.getComponentSnapshot(
    'global-nav-menu',
    { siteVersion: getSiteVersion() }
  )

  if (snapshot == null) return notFound()

  return (
    <>
      <MakeswiftComponent
        snapshot={navSnapshot}
        label="Nav Menu Plus"
        type="navigation"
      />
      <div className="page-content">
      <MakeswiftPage snapshot={snapshot} />
      </div>
    </>
  )
}