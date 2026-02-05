'use client'

import { ComponentPropsWithoutRef } from 'react'
import { useEntryField } from '@/lib/contentful/utils'
import { ContentfulImage } from '../../../common/ContentfulImage'

type BaseProps = {
  fieldPath?: string
  className?: string 
}

type Props = BaseProps & Omit<ComponentPropsWithoutRef<typeof ContentfulImage>, 'field' | 'key'>

export function PortfolioPieceImage({ fieldPath, className, ...rest }: Props) { 
  const field = useEntryField({ fieldPath })

  // Log editor-time field shapes to diagnose "Field is not an asset" in Makeswift
  if (typeof window !== 'undefined' && (window.location.search.includes('makeswift') || window.location.href.includes('makeswift'))) {
    try {
      // eslint-disable-next-line no-console
      console.info('PortfolioPieceImage: field for', fieldPath, field)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PortfolioPieceImage: error while logging field', err)
    }
  }

  // Defensive: when editor preview returns a placeholder or non-asset, don't throw
  const f: any = field
  const looksLikeAsset = field && (typeof f.url === 'string' || f.fields || (f.sys && f.sys.id))
  if (!looksLikeAsset && typeof window !== 'undefined' && (window.location.search.includes('makeswift') || window.location.href.includes('makeswift'))) {
    // Don't render a visual placeholder in the editor; instead log and render nothing.
    // This prevents the 'Field is not an asset' message from showing to users.
    // eslint-disable-next-line no-console
    console.warn('PortfolioPieceImage: non-asset field in preview', fieldPath, field)
    return null
  }

  return <ContentfulImage {...rest} field={field} className={className} />
}
