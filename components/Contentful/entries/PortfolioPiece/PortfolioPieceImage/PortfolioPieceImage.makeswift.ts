import { Combobox, Style } from '@makeswift/runtime/controls'
import { getFieldOptions } from '@/lib/contentful/utils'
import { runtime } from '@/lib/makeswift/runtime'
import { props } from '../../../common/ContentfulImage/ContentfulImage.makeswift'
import { PortfolioPieceImage } from './PortfolioPieceImage'

runtime.registerComponent(PortfolioPieceImage, {
  type: 'portfolio-piece-image',
  label: 'Contentful/Portfolio/Project Image',
    props: {
    ...props,
    className: Style(),
    fieldPath: Combobox({
      label: 'Field',
      async getOptions(query) {
        return getFieldOptions({
          type: 'PortfolioPiece' as any,
          filter: name => name === 'Asset',
          query,
        })
      },
    }),
  },
})
