'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import TransitionLink from '@/components/TransitionLink/TransitionLink'
import { getBlog, getPortfolioPiece } from '@/lib/contentful/fetchers'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RelatedTransitionConfig {
  animationType?: 'ActraiserDrop' | 'LogoSplash' | string
  rotationSpeed?: number
  zoomScale?: number
  transitionDuration?: number
  gradientStart?: string
  gradientEnd?: string
  splashScale?: number
  animatedPathId?: string
  strokeWidth?: number
  splashImage?: string
}

interface RelatedItem {
  _id: string
  slug: string
  title: string
  description?: string | null
  href: string
  image?: { src: string; alt: string; width: number; height: number } | null
  type: 'blog' | 'portfolio'
}

export interface RelatedContentProps {
  /** Array of blog-post slugs pulled from Contentful relatedBlogPosts JSON */
  blogSlugs?: string[]
  /** Array of portfolio slugs pulled from Contentful relatedProjects JSON */
  projectSlugs?: string[]
  /** Transition config forwarded from Makeswift controls */
  transitionConfig?: RelatedTransitionConfig
  className?: string
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_TRANSITION: Required<RelatedTransitionConfig> = {
  animationType: 'ActraiserDrop',
  rotationSpeed: 60,
  zoomScale: 8,
  transitionDuration: 1,
  gradientStart: '#6EB1FF',
  gradientEnd: '#C94F8A',
  splashScale: 3,
  animatedPathId: 'all',
  strokeWidth: 3,
  splashImage: '',
}

// ─── Helper: parse Contentful JSON field into slug array ─────────────────────
// Contentful stores related fields in various ways:
// 1. JSON string: "[\"slug-a\", \"slug-b\"]"
// 2. Plain array: ["slug-a", "slug-b"]
// 3. Comma-separated string: "slug-a,slug-b"
// 4. JSON object with data: { data: [...] }
// 5. If empty/null, returns []

export function parseSlugs(raw: unknown): string[] {
  if (!raw) return []
  
  try {
    // Parse JSON strings
    let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    
    // Handle wrapped data
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // Check for { data: [...] } structure
      if ('data' in parsed && Array.isArray(parsed.data)) {
        parsed = parsed.data
      }
      // If it's still an object (not an array), check if it's empty or return []
      if (!Array.isArray(parsed)) {
        return []
      }
    }
    
    // Now parsed should be an array
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => {
          // Handle string items
          if (typeof item === 'string') return item
          // Handle objects with slug property
          if (item && typeof item === 'object' && 'slug' in item) return item.slug
          // Handle objects with _id or id property (fallback)
          if (item && typeof item === 'object' && '_id' in item) return item._id
          if (item && typeof item === 'object' && 'id' in item) return item.id
          return null
        })
        .filter((s): s is string => typeof s === 'string' && s.length > 0)
    }
    
    // Handle comma-separated string format
    if (typeof parsed === 'string') {
      return parsed
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    }
  } catch (err) {
    // If parsing fails, try comma-separated as fallback
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    }
  }
  
  return []
}

// ─── Card ────────────────────────────────────────────────────────────────────

function RelatedCard({
  item,
  config,
}: {
  item: RelatedItem
  config: Required<RelatedTransitionConfig>
}) {
  return (
    <TransitionLink
      href={{ href: item.href }}
      containerClassName="group relative flex flex-col overflow-hidden rounded-lg card-background shadow-lg transition-all duration-300 hover:shadow-xl"
      animationType={config.animationType}
      rotationSpeed={config.rotationSpeed}
      zoomScale={config.zoomScale}
      transitionDuration={config.transitionDuration}
      gradientStart={config.gradientStart}
      gradientEnd={config.gradientEnd}
      splashScale={config.splashScale}
      animatedPathId={config.animatedPathId}
      strokeWidth={config.strokeWidth}
      splashImage={config.splashImage || undefined}
      aria-label={`View ${item.type === 'blog' ? 'blog post' : 'project'}: ${item.title}`}
    >
      {item.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] w-full bg-(--contrast-100,#f0f0f0)" />
      )}

      <div className="flex flex-1 flex-col p-5 gap-2">
        <span className="text-xs uppercase tracking-widest opacity-50">
          {item.type === 'blog' ? 'Blog Post' : 'Project'}
        </span>
        <h4 className="font-semibold line-clamp-2 leading-snug">{item.title}</h4>
        {item.description && (
          <p className="text-sm line-clamp-3 opacity-70">{item.description}</p>
        )}
      </div>
    </TransitionLink>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RelatedContent({
  blogSlugs = [],
  projectSlugs = [],
  transitionConfig,
  className,
}: RelatedContentProps) {
  const [blogItems, setBlogItems] = useState<RelatedItem[]>([])
  const [projectItems, setProjectItems] = useState<RelatedItem[]>([])
  const [loading, setLoading] = useState(true)

  const config: Required<RelatedTransitionConfig> = {
    ...DEFAULT_TRANSITION,
    ...(transitionConfig || {}),
  }

  useEffect(() => {
    let mounted = true

    async function fetchAll() {
      // Debug: Log incoming slugs
      console.log('[RelatedContent] Fetching with slugs:', { blogSlugs, projectSlugs })
      
      const [blogs, projects] = await Promise.allSettled([
        Promise.all(
          blogSlugs.map(slug =>
            getBlog(slug)
              .then(b => {
                if (!b) {
                  console.warn(`[RelatedContent] Blog not found for slug: ${slug}`)
                  return null
                }
                return {
                  _id: b._id ?? slug,
                  slug,
                  title: b.title ?? slug,
                  description: b.description ?? null,
                  href: `/blog/${slug}`,
                  image: b.banner?.url
                    ? {
                        src: b.banner.url.startsWith('//')
                          ? `https:${b.banner.url}`
                          : b.banner.url,
                        alt: b.banner.description ?? b.title ?? '',
                        width: b.banner.width ?? 800,
                        height: b.banner.height ?? 450,
                      }
                    : null,
                  type: 'blog' as const,
                } satisfies RelatedItem
              })
              .catch(err => {
                console.error(`[RelatedContent] Error fetching blog ${slug}:`, err)
                return null
              })
          )
        ),
        Promise.all(
          projectSlugs.map(slug =>
            getPortfolioPiece(slug)
              .then(p => {
                if (!p) {
                  console.warn(`[RelatedContent] Portfolio piece not found for slug: ${slug}`)
                  return null
                }
                return {
                  _id: p._id ?? slug,
                  slug,
                  title: p.name ?? slug,
                  description: p.description ?? null,
                  href: `/portfolio/${slug}`,
                  image: p.banner?.url
                    ? {
                        src: p.banner.url.startsWith('//')
                          ? `https:${p.banner.url}`
                          : p.banner.url,
                        alt: p.banner.description ?? p.name ?? '',
                        width: p.banner.width ?? 800,
                        height: p.banner.height ?? 450,
                      }
                    : null,
                  type: 'portfolio' as const,
                } satisfies RelatedItem
              })
              .catch(err => {
                console.error(`[RelatedContent] Error fetching portfolio ${slug}:`, err)
                return null
              })
          )
        ),
      ])

      if (!mounted) return

      const blogItems_result = blogs.status === 'fulfilled'
        ? (blogs.value.filter(Boolean) as RelatedItem[])
        : []
      const projectItems_result = projects.status === 'fulfilled'
        ? (projects.value.filter(Boolean) as RelatedItem[])
        : []

      console.log('[RelatedContent] Fetch complete:', {
        blogsLoaded: blogItems_result.length,
        projectsLoaded: projectItems_result.length,
        blogsFailed: blogs.status === 'rejected',
        projectsFailed: projects.status === 'rejected',
      })

      setBlogItems(blogItems_result)
      setProjectItems(projectItems_result)
      setLoading(false)
    }

    if (blogSlugs.length === 0 && projectSlugs.length === 0) {
      console.log('[RelatedContent] No slugs provided, skipping fetch')
      setLoading(false)
      return
    }

    fetchAll()
    return () => { mounted = false }
  }, [blogSlugs.join(','), projectSlugs.join(',')])

  if (loading) return null
  if (blogItems.length === 0 && projectItems.length === 0) return null

  return (
    <section
      className={`mx-auto w-full max-w-4xl mt-10 space-y-8 ${className ?? ''}`}
      aria-label="Related content"
    >
      {projectItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight border-b pb-2 portfolio-h2">
            Related Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
            {projectItems.map(item => (
              <RelatedCard key={item._id} item={item} config={config} />
            ))}
          </div>
        </div>
      )}

      {blogItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight border-b pb-2 portfolio-h2">
            Related Blog Posts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
            {blogItems.map(item => (
              <RelatedCard key={item._id} item={item} config={config} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}