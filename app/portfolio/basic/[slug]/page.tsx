import { notFound } from 'next/navigation'

import { getAllPortfolioPieces, getPortfolioPiece } from '@/lib/contentful/fetchers'
import { formatPortfolio } from '@/lib/contentful/utils'
import { BlogPostContent } from '@/vibes/soul/sections/blog-post-content'

export async function generateStaticParams() {
  const pieces = await getAllPortfolioPieces()
  return pieces.map(p => ({ slug: p?.slug })).filter(Boolean)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug) return notFound()

  const piece = await getPortfolioPiece(slug)
  if (!piece) return notFound()

  const formatted = formatPortfolio(piece)
  if (!formatted) {
    console.error('Failed to format portfolio piece:', piece.slug)
    return notFound()
  }

  const breadcrumbs = [
    { id: '1', label: 'Home', href: '/' },
    { id: '2', label: 'Portfolio', href: '/portfolio' },
    { id: '3', label: formatted.title, href: '#' },
  ]

  return <BlogPostContent breadcrumbs={breadcrumbs} blogPost={formatted} />
}
