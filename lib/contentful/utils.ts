// lib/contentful/utils.ts
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { Document } from '@contentful/rich-text-types'

import { Asset, BlogPostBodyLinks, TypeFragment, TypesDocument } from '@/generated/contentful'
import { client } from '@/lib/contentful/client'
import { useContentfulData } from '@/lib/contentful/provider'
import { BlogPost } from '@/vibes/soul/primitives/blog-post-card'

// Import the type from fetchers.ts
import { QueriedBlogPost } from './fetchers'

// REMOVE the LocalQueriedBlogPost definition and export
// type LocalQueriedBlogPost = { ... } // DELETE THIS
// export type { LocalQueriedBlogPost as QueriedBlogPost } // DELETE THIS

// Keep the rest of your code the same
type FieldPath = { label: string; path: string; type?: string | null }

export type ResolvedField = { data: unknown } | { error: string }

const isRichTextField = (fieldType: TypeFragment) =>
  fieldType.fields?.find(f => f.name === 'json') && fieldType.fields?.find(f => f.name === 'links')

export const isRichText = (field: any): field is { json: Document; links: BlogPostBodyLinks } =>
  field?.json?.nodeType === 'document'

export const isAsset = (field: any): field is Asset => {
  return field?.__typename === 'Asset'
}

function flattenFields(
  root: TypeFragment,
  fields: FieldPath[] = [],
  path: string[] = []
): FieldPath[] {
  if (!root.fields) return fields

  root.fields.forEach(field => {
    const newPath = [...path, field.name]

    fields.push({
      label: [field.name, ...path.slice()].reverse().join(' < '),
      path: newPath.join('.'),
      type: isRichTextField(field.type) ? 'RichText' : field.type.name,
    })

    flattenFields(field.type, fields, newPath)
  })

  return fields
}

export async function getFieldOptions({
  type,
  filter,
  query,
}: {
  type: 'BlogPost'
  filter?: (type?: string | null) => boolean
  query: string
}): Promise<{ id: string; label: string; value: string }[]> {
  const data = await client.request(TypesDocument, { name: type })
  if (!data.__type) return []

  return flattenFields(data.__type)
    .filter(field => (filter ? filter(field.type) : true))
    .filter(field => field.label.toLowerCase().includes(query.toLowerCase()))
    .map(field => ({ id: field.path, label: field.label, value: field.path }))
}

export function resolvePath<T extends string>(
  path: string | Array<T>,
  obj?: { [key: string]: any } | null,
  separator: string = '.'
): any {
  const properties = Array.isArray(path) ? path : path.split(separator)

  return properties.reduce((prev, curr) => prev?.[curr], obj ?? {})
}

export function useEntryField({ fieldPath }: { fieldPath?: string }): ResolvedField {
  const { data: blogs, error } = useContentfulData()
  
  if (error) return { error: 'No entry found.' }
  
  if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
    return <ResolvedField>{ error: 'No entry data available' }
  }

  const entry = blogs[0] as any // Type assertion to any

  // If no explicit fieldPath is provided, attempt to pick a sensible default
  if (!fieldPath) {
    const fallbackCandidates = [
      'title',
      'name',
      'description',
      'body',
      'content',
      'banner',
      'image',
      'publishDate',
      'author',
    ]

    for (const key of fallbackCandidates) {
      if (entry[key] !== undefined && entry[key] !== null) {
        return <ResolvedField>{ data: entry[key] }
      }
    }

    return { error: 'Field path is not set.' }
  }

  // Support nested paths using resolvePath (handles dot-separated paths)
  const field = resolvePath(fieldPath, entry)

  if (field === undefined || field === null) {
    return <ResolvedField>{ error: `Cannot find field "${fieldPath}"` }
  }

  return <ResolvedField>{ data: field }
}

/* export function useEntryField({ fieldPath }: { fieldPath?: string }): ResolvedField {
  const { data, error } = useContentfulData()
  
  console.log('🔍 useEntryField called:', {
    fieldPath,
    hasData: !!data,
    dataType: typeof data,
    isArray: Array.isArray(data),
    data: data, // Log the actual data
  })
  
  if (error) return { error: 'No entry found.' }
  
  if (!fieldPath) return { error: 'Field path is not set.' }
  
  const field = resolvePath(fieldPath, data)
  
  console.log('🔍 useEntryField result:', {
    fieldPath,
    field,
    found: !!field,
  })
  
  if (!field) return { error: `Cannot find field at ${fieldPath}. Check the graphql query.` }
  
  return { data: field }
} */

/* export const formatBlogs = (blogs: QueriedBlogPost[], includeBody: boolean = true): BlogPost[] => {
  return blogs.map(blog => formatBlog(blog, includeBody))
} */

// Update formatBlog to use QueriedBlogPost from fetchers
export const formatBlog = (blog: QueriedBlogPost, includeBody: boolean = true): BlogPost | null => {
  try {
    // Check for absolute minimum required fields
    if (!blog.title || !blog.publishDate) {
      console.warn('Blog missing title or publishDate:', {
        id: blog._id,
        title: blog.title,
        publishDate: blog.publishDate,
        slug: blog.slug,
      })
      return null
    }

    const title = blog.title
    const publishDate = blog.publishDate
    
    // ALWAYS initialize content with a default string
    let content = 'No content available'
    
    if (includeBody && blog.body?.json) {
      if (!isRichText(blog.body)) {
        console.warn('Blog body is not rich text:', blog.body)
        content = blog.description || 'No content available'
      } else {
        try {
          const htmlContent = documentToHtmlString(blog.body.json)
          content = htmlContent || 'No content available'
        } catch (error) {
          console.error('Error converting rich text to HTML:', error)
          content = blog.description || 'No content available'
        }
      }
    } else if (blog.description) {
      content = blog.description
    }

    // Build the image object if banner exists
    const image = blog.banner?.url ? { 
      src: blog.banner.url, 
      alt: blog.banner.description || title 
    } : null

    return {
      title,
      date: new Date(publishDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      content, // Now guaranteed to be a string
      image,
      author: blog.author || undefined,
      href: `/blog/${blog.slug || blog._id}`,
    }
  } catch (error) {
    console.error('Error formatting blog:', error, blog)
    return null
  }
}

// Format portfolio pieces into the same shape as BlogPost so we can reuse layout components
export const formatPortfolio = (piece: any): BlogPost | null => {
  try {
    const title = piece?.name || piece?.title || 'Untitled Project'

    let content = 'No content available'
    if (piece?.body?.json) {
      try {
        const htmlContent = documentToHtmlString(piece.body.json)
        content = htmlContent || (piece.description || 'No content available')
      } catch (err) {
        console.warn('Error converting portfolio rich text to HTML:', err)
        content = piece.description || 'No content available'
      }
    } else if (piece?.description) {
      content = piece.description
    }

    const image = piece.banner?.url ? { src: piece.banner.url, alt: piece.banner.description || title } : null

    return {
      title,
      date: piece?.publishDate || piece?.projectId ? String(piece.projectId ?? '') : '',
      content,
      image,
      author: undefined,
      href: `/portfolio/${piece.slug || piece._id}`,
    }
  } catch (err) {
    console.error('Error formatting portfolio piece:', err, piece)
    return null
  }
}