import { Style, Slot, Group, Color, Number, Checkbox, TextInput } from '@makeswift/runtime/controls'
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
    
    // Pagination SVG Controls - COMPLETE EnhancedSVG props
    paginationIcon: Group({
      label: 'Pagination SVG Animation',
      props: {
        // COLOR PROPS - THESE WERE MISSING
        lightStrokeColor: Color({
          label: 'Light Theme Stroke',
          defaultValue: '#000000',
        }),
        darkStrokeColor: Color({
          label: 'Dark Theme Stroke',
          defaultValue: '#ffffff',
        }),
        lightFillColor: Color({
          label: 'Light Theme Fill',
          defaultValue: '#000000',
        }),
        darkFillColor: Color({
          label: 'Dark Theme Fill',
          defaultValue: '#ffffff',
        }),
        // ANIMATION PROPS
        enableGradientDraw: Checkbox({
          label: 'Enable Gradient Animation',
          defaultValue: true,
        }),
        gradientStartColor: Color({
          label: 'Gradient Start Color',
          defaultValue: '#6EB1FF',
        }),
        gradientEndColor: Color({
          label: 'Gradient End Color',
          defaultValue: '#C94F8A',
        }),
        gradientDuration: Number({
          label: 'Animation Duration (seconds)',
          defaultValue: 10,
          min: 0.5,
          max: 20,
          step: 0.1,
        }),
        resetDuration: Number({
          label: 'Reset Speed (0.1-1.0)',
          defaultValue: 0.1,
          min: 0.1,
          max: 1.0,
          step: 0.1,
        }),
        logoStrokeWidth: Number({
          label: 'Stroke Width',
          defaultValue: 6,
          min: 0.5,
          max: 20,
          step: 0.1,
        }),
        animatePaths: TextInput({
          label: 'Paths to animate',
          description: 'Element IDs to animate',
          defaultValue: 'arrow',
        }),
      },
    }),

    // Return to Blog SVG Controls - COMPLETE EnhancedSVG props
    returnIcon: Group({
      label: 'Return to Blog SVG Animation',
      props: {
        // COLOR PROPS - THESE WERE MISSING
        lightStrokeColor: Color({
          label: 'Light Theme Stroke',
          defaultValue: '#000000',
        }),
        darkStrokeColor: Color({
          label: 'Dark Theme Stroke',
          defaultValue: '#ffffff',
        }),
        lightFillColor: Color({
          label: 'Light Theme Fill',
          defaultValue: '#000000',
        }),
        darkFillColor: Color({
          label: 'Dark Theme Fill',
          defaultValue: '#ffffff',
        }),
        // ANIMATION PROPS
        enableGradientDraw: Checkbox({
          label: 'Enable Gradient Animation',
          defaultValue: true,
        }),
        gradientStartColor: Color({
          label: 'Gradient Start Color',
          defaultValue: '#6EB1FF',
        }),
        gradientEndColor: Color({
          label: 'Gradient End Color',
          defaultValue: '#C94F8A',
        }),
        gradientDuration: Number({
          label: 'Animation Duration (seconds)',
          defaultValue: 1.5,
          min: 0.5,
          max: 20,
          step: 0.1,
        }),
        resetDuration: Number({
          label: 'Reset Speed (0.1-1.0)',
          defaultValue: 0.1,
          min: 0.1,
          max: 1.0,
          step: 0.1,
        }),
        logoStrokeWidth: Number({
          label: 'Stroke Width',
          defaultValue: 6,
          min: 0.5,
          max: 20,
          step: 0.1,
        }),
        animatePaths: TextInput({
          label: 'Paths to animate',
          description: 'Element IDs to animate',
          defaultValue: 'frame, blog1, blog2, blog3, frame',
        }),
      },
    }),
    
    children: Slot(),
  },
})