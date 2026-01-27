import { Style, Slot, Group } from '@makeswift/runtime/controls'
import { runtime } from '@/lib/makeswift/runtime'
import PortfolioContentWithSlot from './PortfolioContentWithSlot'

export const PORTFOLIO_CONTENT_WITH_SLOT_TYPE = 'portfolioContentWithSlot'

runtime.registerComponent(PortfolioContentWithSlot, {
  label: 'Portfolio Content with Slot',
  type: PORTFOLIO_CONTENT_WITH_SLOT_TYPE,
  props: {
    className: Style({ properties: Style.All }),
    title: Group({ label: 'Title', props: { style: Style({ properties: Style.All }) } }),
    description: Group({ label: 'Description', props: { style: Style({ properties: Style.All }) } }),
    body: Group({ label: 'Body', props: { style: Style({ properties: Style.All }) } }),
    h1: Group({ label: 'H1 Style', props: { style: Style({ properties: Style.All }) } }),
    h2: Group({ label: 'H2 Style', props: { style: Style({ properties: Style.All }) } }),
    h3: Group({ label: 'H3 Style', props: { style: Style({ properties: Style.All }) } }),
    children: Slot(),
  },
})
