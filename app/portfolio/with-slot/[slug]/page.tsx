import { notFound } from 'next/navigation'

import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'

import { client } from '@/lib/contentful/client'
import { getAllPortfolioPieces } from '@/lib/contentful/fetchers'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { client as MakeswiftClient } from '@/lib/makeswift/client'

export async function generateStaticParams() {
  const pieces = await getAllPortfolioPieces()
  return pieces.map(p => ({ slug: p?.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug) return notFound()

  const componentSnapshot = await MakeswiftClient.getComponentSnapshot(
    'portfolioContentWithSlot',
    {
      siteVersion: await getSiteVersion(),
    }
  )

  if (componentSnapshot == null) return notFound()

  const QUERY = `
    query GetPortfolioPiece($filter: PortfolioPieceFilter) {
      portfolioPieceCollection(where: $filter, limit: 1) {
        items {
          __typename
          _id
          slug
          projectId
          name
          description
          recentProject
          body { json }
          banner { url width height title description }
        }
      }
    }
  `

  const { portfolioPieceCollection } = await client.request(QUERY, { filter: { slug } })
  if (!portfolioPieceCollection) return notFound()

  return (
    <ContentfulProvider value={portfolioPieceCollection}>
      <MakeswiftComponent
        snapshot={componentSnapshot}
        label="Portfolio Content with Slot"
        type={'portfolioContentWithSlot'}
      />
    </ContentfulProvider>
  )
}
