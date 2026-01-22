// BlogContentWithSlot.makeswift.ts - ADD h1-h6
import { Style, Slot, Group } from '@makeswift/runtime/controls'
import { runtime } from '@/lib/makeswift/runtime'
import BlogContentWithSlot from './BlogContentWithSlot'

export const BLOG_CONTENT_WITH_SLOT_TYPE = 'blogContentWithSlot'

runtime.registerComponent(BlogContentWithSlot, {
  label: 'Blog Content with Slot',
  type: BLOG_CONTENT_WITH_SLOT_TYPE,
  props: {
    className: Style({ properties: Style.All }),
    title: Group({ label: 'Title', props: { style: Style({ properties: Style.All }) } }),
    date: Group({ label: 'Date', props: { style: Style({ properties: Style.All }) } }),
    author: Group({ label: 'Author', props: { style: Style({ properties: Style.All }) } }),
    description: Group({ label: 'Description', props: { style: Style({ properties: Style.All }) } }),
    body: Group({ label: 'Body', props: { style: Style({ properties: Style.All }) } }),
    h1: Group({ label: 'H1 Style', props: { style: Style({ properties: Style.All }) } }),
    h2: Group({ label: 'H2 Style', props: { style: Style({ properties: Style.All }) } }),
    h3: Group({ label: 'H3 Style', props: { style: Style({ properties: Style.All }) } }),
    h4: Group({ label: 'H4 Style', props: { style: Style({ properties: Style.All }) } }),
    h5: Group({ label: 'H5 Style', props: { style: Style({ properties: Style.All }) } }),
    h6: Group({ label: 'H6 Style', props: { style: Style({ properties: Style.All }) } }),
    children: Slot(),
  },
})