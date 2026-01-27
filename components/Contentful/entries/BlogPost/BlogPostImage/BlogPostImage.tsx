'use client'
import { ComponentPropsWithoutRef } from 'react'
import { useEntryField } from '@/lib/contentful/utils'
import { ContentfulImage } from '../../../common/ContentfulImage'

type BaseProps = {
  fieldPath?: string
  className?: string 
}

type Props = BaseProps & Omit<ComponentPropsWithoutRef<typeof ContentfulImage>, 'field' | 'key'>

export function BlogPostImage({ fieldPath, className, ...rest }: Props) { 
  const field = useEntryField({ fieldPath })
  // Log editor-time field shapes to diagnose "Field is not an asset" in Makeswift
  if (typeof window !== 'undefined' && (window.location.search.includes('makeswift') || window.location.href.includes('makeswift'))) {
    try {
      // eslint-disable-next-line no-console
      console.info('BlogPostImage: field for', fieldPath, field)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('BlogPostImage: error while logging field', err)
    }
  }

  // Defensive: when editor preview returns a placeholder or non-asset, don't throw
  const f: any = field
  const looksLikeAsset = field && (typeof f.url === 'string' || f.fields || (f.sys && f.sys.id))
  if (!looksLikeAsset && typeof window !== 'undefined' && (window.location.search.includes('makeswift') || window.location.href.includes('makeswift'))) {
    // Do not show a visual placeholder in preview — log for debugging and render nothing.
    // This avoids displaying 'Field is not an asset' or placeholder UI to content editors.
    // eslint-disable-next-line no-console
    console.warn('BlogPostImage: non-asset field in preview', fieldPath, field)
    return null
  }

  return <ContentfulImage {...rest} field={field} className={className} />
}