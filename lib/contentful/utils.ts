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
  const { data, error } = useContentfulData()

  if (error) return { error: 'No entry found.' }

  if (!fieldPath) return { error: 'Field path is not set.' }

  const field = resolvePath(fieldPath, data)

  if (!field) return { error: `Cannot find field at ${fieldPath}. Check the graphql query.` }

  return { data: field }
}

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