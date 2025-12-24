import { NextResponse } from 'next/server'
import { getAllBlogs } from '@/lib/contentful/fetchers'

export async function GET() {
  try {
    const blogs = await getAllBlogs()
    return NextResponse.json({ ok: true, count: Array.isArray(blogs) ? blogs.length : 0, blogs })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching blogs for debug endpoint', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
