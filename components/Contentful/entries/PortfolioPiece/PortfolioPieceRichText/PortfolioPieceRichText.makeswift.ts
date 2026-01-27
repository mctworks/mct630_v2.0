import dynamic from 'next/dynamic'

import { Combobox } from '@makeswift/runtime/controls'

import { getFieldOptions } from '@/lib/contentful/utils'
import { runtime } from '@/lib/makeswift/runtime'

import { props } from '../../../common/ContentfulRichText/ContentfulRichText.makeswift'
import { PortfolioPieceRichText } from './PortfolioPieceRichText'

runtime.registerComponent(PortfolioPieceRichText, {
  type: 'portfolio-piece-rich-text',
  label: 'Contentful/Portfolio/Portfolio Rich Text',
  props: {
    ...props,
    fieldPath: Combobox({
      label: 'Field',
      async getOptions(query) {
        return getFieldOptions({
          type: 'PortfolioPiece',
          filter: name => /richtext|body/i.test(name),
          query,
        })
      },
    }),
  },
})
