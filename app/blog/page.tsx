import { getAllBlogs } from '@/lib/contentful/fetchers'
import { formatBlogs } from '@/lib/contentful/utils'
import { BlogPostList } from '@/vibes/soul/sections/blog-post-list'
import { SectionLayout } from '@/vibes/soul/sections/section-layout'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { client } from '@/lib/makeswift/client'

export default async function Page() {
  const blogs = await getAllBlogs()
  const formattedBlogs = formatBlogs(blogs, false)
  
  const transitionsSnapshot = await client.getComponentSnapshot(
    'blog-transitions-config',
    { siteVersion: await getSiteVersion() }
  )

  return (
    <div className="page-content">
      <MakeswiftComponent snapshot={transitionsSnapshot} label="Blog Transitions" type="blog-list-transitions" />
      <SectionLayout>
        <BlogPostList blogPosts={formattedBlogs} />
      </SectionLayout>
    </div>
  )
}