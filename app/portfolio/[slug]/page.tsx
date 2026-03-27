import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { MakeswiftProvider } from '@/lib/makeswift/provider'

import { client } from '@/lib/contentful/client'
import { client as MakeswiftClient } from '@/lib/makeswift/client'
import { ContentfulProvider } from '@/lib/contentful/provider'
import { getAllPortfolioPieces, getPortfolioPiece } from '@/lib/contentful/fetchers'
import { PORTFOLIO_CONTENT_WITH_SLOT_TYPE } from '@/components/PortfolioContentWithSlot/PortfolioContentWithSlot.makeswift'

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null
  return url.startsWith('//') ? `https:${url}` : url
}

async function buildPortfolioMetadata(slug?: string): Promise<Metadata> {
  const baseDesc =
    'Portfolio and Blog for Michael C. Thompson, a full-stack web developer specializing in front-end development based in the Atlanta area.'
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mct630.com')

  if (slug) {
    const piece = await getPortfolioPiece(slug)
    if (piece?.name) {
      const title = `MCT630 | Portfolio | ${piece.name}`
      const description = typeof piece.description === 'string' && piece.description
        ? piece.description
        : baseDesc
      const imageUrl = normalizeUrl(piece.banner?.url) ?? '/mct630_og_card.jpeg'

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
  return buildPortfolioMetadata(slug)
}

export async function generateStaticParams() {
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
          relatedProjects
          relatedBlogPosts
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
    if (resolved && portfolioPieceCollection?.items?.[0]) {
      const item = portfolioPieceCollection.items[0] as any

      // Merge rich text body with resolved asset links
      item.body = {
        ...item.body,
        ...(resolved.body || {}),
      }

      // relatedProjects and relatedBlogPosts are already in the QUERY above,
      // but getPortfolioPiece also fetches them — prefer resolved values as
      // they go through the same fetcher normalization path
      item.relatedProjects = resolved.relatedProjects ?? item.relatedProjects ?? null
      item.relatedBlogPosts = resolved.relatedBlogPosts ?? item.relatedBlogPosts ?? null
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