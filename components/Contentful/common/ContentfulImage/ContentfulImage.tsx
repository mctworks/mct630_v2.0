import Image, { ImageProps } from 'next/image'

import clsx from 'clsx'
import { isDevelopment } from 'utils/isDevelopment'


import { ResolvedField, isAsset } from '../../../../lib/contentful/utils'

type Props = {
  className?: string
  field: ResolvedField
  square?: boolean
  key?: string
} & Partial<ImageProps>

export function ContentfulImage({ className, field, square, ...rest }: Props) {
  // On missing or invalid fields, avoid rendering visible warnings (no placeholders).
  // Instead log details to the console for debugging and return null so the page layout
  // doesn't show developer UI in preview or production.
  if ('error' in field) {
    if (typeof window !== 'undefined') console.warn('ContentfulImage: field error', field.error)
    return null
  }

  // Accept either a true Contentful Asset or any object with a URL property.
  const data: any = field.data
  if (!data || typeof data !== 'object') {
    if (typeof window !== 'undefined') console.warn('ContentfulImage: field is not an object', field.data)
    return null
  }

  if (!data.url || typeof data.url !== 'string') {
    if (typeof window !== 'undefined') console.warn('ContentfulImage: asset is missing URL', data)
    return null
  }

  return (
    <Image
      {...rest}
      className={clsx(className, square && 'aspect-square object-cover')}
      src={field.data.url}
      alt={field.data.title ?? 'No alt text provided.'}
      width={field.data.width ?? 200}
      height={field.data.height ?? 200}
    />
  )
}
