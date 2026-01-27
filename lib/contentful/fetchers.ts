import { BlogPostOrder, GetBlogsDocument } from '@/generated/contentful'

import { client } from './client'

const PAGINATION_LIMIT = 100 // Contentful's max items per page

export type QueriedBlogPost = {
  __typename: 'BlogPost'
  _id: string
  slug?: string | null
  title?: string | null
  description?: string | null
  publishDate?: string | null
  author?: string | null
  relatedProjects?: any | null // Add this
  relatedBlogPosts?: any | null // Add this
  body?: {
    __typename?: 'BlogPostBody'
    json?: {
      [key: string]: any
    } | null
  } | null
  banner?: {
    __typename: 'Asset'
    title?: string | null
    description?: string | null
    contentType?: string | null
    fileName?: string | null
    url?: string | null
    width?: number | null
    height?: number | null
  } | null
}

export async function getAllBlogs(): Promise<QueriedBlogPost[]> {
  const QUERY = `
    query GetBlogsWithLinks($limit: Int!, $skip: Int!, $order: [BlogPostOrder]) {
      blogPostCollection(limit: $limit, skip: $skip, order: $order) {
        items {
          __typename
          _id
          slug
          title
          description
          body { json }
          banner { url width height title description }
          publishDate
          author
        }
      }
    }
  `

  let allBlogs: any[] = []
  let hasMore = true
  let skip = 0

  while (hasMore) {
    const { blogPostCollection } = await client.request(QUERY, {
      limit: PAGINATION_LIMIT,
      skip,
      order: [BlogPostOrder.PublishDateDesc],
    })

    const items = blogPostCollection?.items ?? []
    allBlogs.push(...items)

    hasMore = items.length === PAGINATION_LIMIT
    skip += PAGINATION_LIMIT
  }

  return allBlogs as unknown as QueriedBlogPost[]
}

export async function getBlog(slug: string): Promise<QueriedBlogPost | null> {
  const QUERY = `
    query GetBlogWithLinks($filter: BlogPostFilter) {
      blogPostCollection(where: $filter, limit: 1) {
        items {
          __typename
          _id
          slug
          title
          description
          body { json }
          banner { url width height title description }
          publishDate
          author
        }
      }
    }
  `

  const { blogPostCollection } = await client.request(QUERY, { filter: { slug } })
  const blog = (blogPostCollection?.items[0] as unknown as QueriedBlogPost) ?? null

  // Resolve embedded asset ids into actual asset objects so rich-text renderers can access URLs
  if (blog && blog.body?.json) {
    try {
      const ids = new Set<string>()
      const walk = (node: any) => {
        if (!node || typeof node !== 'object') return
        if (node.nodeType && (node.nodeType === 'embedded-asset-block' || node.nodeType === 'embedded-asset-inline')) {
          const id = node?.data?.target?.sys?.id
          if (id) ids.add(id)
        }
        if (Array.isArray(node.content)) node.content.forEach(walk)
      }
      walk(blog.body.json)

      if (ids.size > 0) {
        const assets: any[] = []
        for (const id of Array.from(ids)) {
          try {
            const A = await client.request(`query GetAsset($id: String!) { asset(id: $id) { sys { id } url title description width height } }`, { id })
            if (A && A.asset) assets.push(A.asset)
          } catch (err) {
            // ignore individual asset fetch failures
          }
        }

        // Attach a minimal links structure expected by renderers
        ;(blog as any).body.links = {
          assets: {
            block: assets,
            inline: [],
          },
          entries: {
            block: [],
            inline: [],
            hyperlink: [],
          },
          resources: { block: [], inline: [], hyperlink: [] },
        }
      }
    } catch (err) {
      // ignore
    }
  }

  return blog
}

export type QueriedPortfolioPiece = {
  __typename: 'PortfolioPiece'
  _id: string
  slug?: string | null
  projectId?: number | null
  name?: string | null
  description?: string | null
  recentProject?: boolean | null
  body?: {
    __typename?: 'PortfolioPieceBody'
    json?: { [key: string]: any } | null
  } | null
  banner?: {
    __typename: 'Asset'
    title?: string | null
    description?: string | null
    contentType?: string | null
    fileName?: string | null
    url?: string | null
    width?: number | null
    height?: number | null
  } | null
}

export async function getAllPortfolioPieces(): Promise<QueriedPortfolioPiece[]> {
  const QUERY = `
    query GetPortfolioPieces($limit: Int!, $skip: Int!) {
      portfolioPieceCollection(limit: $limit, skip: $skip) {
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

  let all: any[] = []
  let hasMore = true
  let skip = 0

  while (hasMore) {
    const { portfolioPieceCollection } = await client.request(QUERY, { limit: PAGINATION_LIMIT, skip })
    const items = portfolioPieceCollection?.items ?? []
    all.push(...items)
    hasMore = items.length === PAGINATION_LIMIT
    skip += PAGINATION_LIMIT
  }

  return all as unknown as QueriedPortfolioPiece[]
}

export async function getPortfolioPiece(slug: string): Promise<QueriedPortfolioPiece | null> {
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
  const piece = (portfolioPieceCollection?.items[0] as unknown as QueriedPortfolioPiece) ?? null

  if (piece && piece.body?.json) {
    // resolve embedded assets like getBlog
    try {
      const ids = new Set<string>()
      const walk = (node: any) => {
        if (!node || typeof node !== 'object') return
        if (node.nodeType && (node.nodeType === 'embedded-asset-block' || node.nodeType === 'embedded-asset-inline')) {
          const id = node?.data?.target?.sys?.id
          if (id) ids.add(id)
        }
        if (Array.isArray(node.content)) node.content.forEach(walk)
      }
      walk(piece.body.json)

      if (ids.size > 0) {
        const assets: any[] = []
        for (const id of Array.from(ids)) {
          try {
            const A = await client.request(`query GetAsset($id: String!) { asset(id: $id) { sys { id } url title description width height } }`, { id })
            if (A && A.asset) assets.push(A.asset)
          } catch (err) {
            // ignore
          }
        }

        ;(piece as any).body.links = {
          assets: { block: assets, inline: [] },
          entries: { block: [], inline: [], hyperlink: [] },
          resources: { block: [], inline: [], hyperlink: [] },
        }
      }
    } catch (err) {
      // ignore
    }
  }

  return piece
}
