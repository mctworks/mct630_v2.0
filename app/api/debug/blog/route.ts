import { NextResponse } from 'next/server'
import { getBlog } from '@/lib/contentful/fetchers'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')
    if (!slug) return NextResponse.json({ ok: false, error: 'Missing slug' }, { status: 400 })
    const blog = await getBlog(slug)
    if (!blog) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, blog })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching blog for debug endpoint', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
