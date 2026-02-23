import React from 'react'
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
  if ('error' in field) {
    if (typeof window !== 'undefined') console.warn('ContentfulImage: field error', field.error)
    return null
  }

  const data: any = field.data
  if (!data || typeof data !== 'object') {
    if (typeof window !== 'undefined') console.warn('ContentfulImage: field is not an object', field.data)
    return null
  }

  if (!data.url || typeof data.url !== 'string') {
    if (typeof window !== 'undefined') console.warn('ContentfulImage: asset is missing URL', data)
    return null
  }

  const src = String(data.url).startsWith('//') ? `https:${data.url}` : String(data.url)
  const isPdf = data.contentType === 'application/pdf' || src.toLowerCase().includes('.pdf')

  if (isPdf) {
    return React.createElement(
      'div',
      { className: clsx(className, 'w-full') },
      React.createElement('iframe', {
        src,
        className: 'w-full',
        style: { minHeight: '600px', border: 'none' },
        title: data.title ?? 'PDF document',
      }),
      React.createElement(
        'a',
        {
          href: src,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'inline-block mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700',
        },
        'Open PDF'
      )
    )
  }

  return (
    <Image
      {...rest}
      className={clsx(className, square && 'aspect-square object-cover')}
      src={data.url}
      alt={data.title ?? 'No alt text provided.'}
      width={data.width ?? 200}
      height={data.height ?? 200}
    />
  )
}