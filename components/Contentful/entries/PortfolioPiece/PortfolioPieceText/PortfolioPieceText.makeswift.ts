import { Combobox } from '@makeswift/runtime/controls'

import { getFieldOptions } from '@/lib/contentful/utils'
import { runtime } from '@/lib/makeswift/runtime'

import { props } from '../../../common/ContentfulText/ContentfulText.makeswift'
import { PortfolioPieceText } from './PortfolioPieceText'

runtime.registerComponent(PortfolioPieceText, {
  type: 'portfolio-piece-text',
  label: 'Contentful/Portfolio/Project Text',
  props: {
    ...props,
    fieldPath: Combobox({
      label: 'Field',
      async getOptions(query) {
        return getFieldOptions({
          type: 'PortfolioPiece' as any,
          filter: name => name === 'String',
          query,
        })
      },
    }),
  },
})
