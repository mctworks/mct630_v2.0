import { notFound } from 'next/navigation'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { MakeswiftProvider } from '@/lib/makeswift/provider'

import { client } from '@/lib/contentful/client'
import { client as MakeswiftClient } from '@/lib/makeswift/client'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { getPortfolioPiece } from '@/lib/contentful/fetchers'
import { PORTFOLIO_CONTENT_WITH_SLOT_TYPE } from '@/components/PortfolioContentWithSlot/PortfolioContentWithSlot.makeswift'

export async function generateStaticParams() {
  const { getAllPortfolioPieces } = await import('@/lib/contentful/fetchers')
  const pieces = await getAllPortfolioPieces()
  return pieces.map(p => ({ slug: p?.slug })).filter(Boolean)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug) return notFound()

  const componentSnapshot = await MakeswiftClient.getComponentSnapshot(
    'portfolioContentWithSlot',
    { siteVersion: await getSiteVersion() }
  )

  if (componentSnapshot == null) {
    console.warn('PortfolioContentWithSlot component not found in Makeswift')
    return notFound()
  }

  // Use client.request to get the raw GraphQL collection
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

  if (!portfolioPieceCollection) {
    console.warn(`Portfolio piece not found for slug: ${slug}`)
    return notFound()
  }

  try {
    const resolved = await getPortfolioPiece(slug)
    if (resolved && portfolioPieceCollection && portfolioPieceCollection.items && portfolioPieceCollection.items[0]) {
      ;(portfolioPieceCollection.items[0] as any).body = {
        ...(portfolioPieceCollection.items[0] as any).body,
        ...(resolved.body || {}),
      }
    }
  } catch (err) {
    console.warn('Failed to resolve inline assets for portfolio body', err)
  }

  return (
    <MakeswiftProvider siteVersion={await getSiteVersion()}>
      <ContentfulProvider value={portfolioPieceCollection as any}>
        <MakeswiftComponent
          snapshot={componentSnapshot}
          label="Portfolio Content with Slot"
          type={PORTFOLIO_CONTENT_WITH_SLOT_TYPE}
        />
      </ContentfulProvider>
    </MakeswiftProvider>
  )
}
