import { Style, Slot, Group, Color, Number, Checkbox, TextInput, Select } from '@makeswift/runtime/controls'
import { runtime } from '@/lib/makeswift/runtime'
import BlogContentWithSlot from './BlogContentWithSlot'

export const BLOG_CONTENT_WITH_SLOT_TYPE = 'blogContentWithSlot'

// Reusable EnhancedSVG prop group factory
const svgAnimationGroup = (
  label: string,
  defaults: {
    gradientDuration?: number
    animatePaths?: string
  } = {}
) =>
  Group({
    label,
    props: {
      lightStrokeColor: Color({ label: 'Light Theme Stroke', defaultValue: '#000000' }),
      darkStrokeColor: Color({ label: 'Dark Theme Stroke', defaultValue: '#ffffff' }),
      lightFillColor: Color({ label: 'Light Theme Fill', defaultValue: '#000000' }),
      darkFillColor: Color({ label: 'Dark Theme Fill', defaultValue: '#ffffff' }),
      enableGradientDraw: Checkbox({ label: 'Enable Gradient Animation', defaultValue: true }),
      gradientStartColor: Color({ label: 'Gradient Start Color', defaultValue: '#6EB1FF' }),
      gradientEndColor: Color({ label: 'Gradient End Color', defaultValue: '#C94F8A' }),
      gradientDuration: Number({
        label: 'Animation Duration (seconds)',
        defaultValue: defaults.gradientDuration ?? 10,
        min: 0.5,
        max: 20,
        step: 0.1,
      }),
      resetDuration: Number({ label: 'Reset Speed (0.1-1.0)', defaultValue: 0.1, min: 0.1, max: 1.0, step: 0.1 }),
      logoStrokeWidth: Number({ label: 'Stroke Width', defaultValue: 6, min: 0.5, max: 20, step: 0.1 }),
      animatePaths: TextInput({
        label: 'Paths to animate',
        description: 'Element IDs to animate',
        defaultValue: defaults.animatePaths ?? 'arrow',
      }),
    },
  })

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

    // Related section transition controls
    relatedSection: Group({
      label: 'Related Content Transitions',
      props: {
        animationType: Select({
          label: 'Animation Type',
          options: [
            { label: 'Actraiser Drop', value: 'ActraiserDrop' },
            { label: 'Logo Splash', value: 'LogoSplash' },
          ],
          defaultValue: 'ActraiserDrop',
        }),
        rotationSpeed: Number({ label: 'Rotation Speed (deg)', defaultValue: 60, step: 10 }),
        zoomScale: Number({ label: 'Zoom Scale', defaultValue: 8, step: 0.5 }),
        transitionDuration: Number({ label: 'Duration (s)', defaultValue: 1, step: 0.1 }),
        gradientStart: Color({ label: 'Gradient Start', defaultValue: '#6EB1FF' }),
        gradientEnd: Color({ label: 'Gradient End', defaultValue: '#C94F8A' }),
        splashScale: Number({ label: 'Splash Scale (LogoSplash)', defaultValue: 3, step: 0.5 }),
        animatedPathId: TextInput({
          label: 'Path IDs (LogoSplash)',
          description: "Comma-separated IDs, 'all', or 'none'",
          defaultValue: 'all',
        }),
        strokeWidth: Number({ label: 'Stroke Width', defaultValue: 3, step: 0.5 }),
        splashImage: TextInput({
          label: 'Splash Image URL (LogoSplash)',
          description: 'Path to SVG used for LogoSplash overlay',
          defaultValue: '/icons/MCT630_blog_icon.v.1.0.svg',
        }),
      },
    }),

    paginationIcon: svgAnimationGroup('Pagination SVG Animation', {
      gradientDuration: 10,
      animatePaths: 'arrow',
    }),

    returnIcon: svgAnimationGroup('Return to Blog SVG Animation', {
      gradientDuration: 1.5,
      animatePaths: 'frame, blog1, blog2, blog3, frame',
    }),

    children: Slot(),
  },
})