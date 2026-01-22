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
  return <ContentfulImage {...rest} field={field} className={className} />
}