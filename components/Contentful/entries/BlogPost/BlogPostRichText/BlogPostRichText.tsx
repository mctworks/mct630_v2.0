// BlogPostRichText.tsx - FORCE FONT APPLICATION
'use client'

import { ComponentPropsWithoutRef } from 'react'
import { useEntryField } from '@/lib/contentful/utils'
import { ContentfulRichText } from 'components/Contentful/common/ContentfulRichText/ContentfulRichText'

type BaseProps = {
  fieldPath?: string
  className?: string
  bannerUrl?: string
  h1ClassName?: string
  h2ClassName?: string
  h3ClassName?: string
  h4ClassName?: string
  h5ClassName?: string
  h6ClassName?: string
}

type Props = BaseProps & Omit<ComponentPropsWithoutRef<typeof ContentfulRichText>, 'field'>

export function BlogPostRichText({ 
  fieldPath, 
  className,
  bannerUrl,
  h1ClassName,
  h2ClassName,
  h3ClassName,
  h4ClassName,
  h5ClassName,
  h6ClassName,
  ...rest 
}: Props) {
  const field = useEntryField({ fieldPath })
  
  return (
    <ContentfulRichText 
      {...rest} 
      className={className}
      bannerUrl={bannerUrl}
      h1ClassName={h1ClassName}
      h2ClassName={h2ClassName}
      h3ClassName={h3ClassName}
      h4ClassName={h4ClassName}
      h5ClassName={h5ClassName}
      h6ClassName={h6ClassName}
      field={field} 
    />
  )
}