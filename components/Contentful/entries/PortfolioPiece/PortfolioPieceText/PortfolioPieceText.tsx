import { ComponentPropsWithoutRef } from 'react'
import { useEntryField } from '@/lib/contentful/utils'
import { ContentfulText } from '../../../common/ContentfulText/ContentfulText'
import { clsx } from 'clsx'

type BaseProps = {
  fieldPath?: string
  className?: string
}

type Props = BaseProps & Omit<ComponentPropsWithoutRef<typeof ContentfulText>, 'field'>

export function PortfolioPieceText({ fieldPath, className, ...rest }: Props) {
  const field = useEntryField({ fieldPath })
  return (
    <ContentfulText
      {...rest}
      field={field}
      className={clsx(className, 'not-prose')}
    />
  )
}

