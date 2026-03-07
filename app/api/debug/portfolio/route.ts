import { NextResponse } from 'next/server'
import { getPortfolioPiece } from '@/lib/contentful/fetchers'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')
    if (!slug) return NextResponse.json({ ok: false, error: 'Missing slug' }, { status: 400 })
    const piece = await getPortfolioPiece(slug)
    if (!piece) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, piece })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching portfolio for debug endpoint', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
