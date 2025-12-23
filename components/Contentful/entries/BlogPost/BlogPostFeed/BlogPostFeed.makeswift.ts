import { Number, Style, Checkbox, Select, Color, Image, TextInput } from '@makeswift/runtime/controls'
import { runtime } from '@/lib/makeswift/runtime'
import { BlogPostFeed } from './BlogPostFeed'

runtime.registerComponent(BlogPostFeed, {
  type: 'BlogFeed',
  label: 'Contentful/Blog/Feed',
  props: {
    className: Style(),
    itemsPerPage: Number({
      label: 'Items per page',
      defaultValue: 3,
      min: 1,
    }),
    // Transition controls
    enableTransitions: Checkbox({
      label: 'Enable Transitions',
      defaultValue: true,
    }),
    animationType: Select({
      label: 'Animation Type',
      options: [
        { label: 'ActraiserDrop', value: 'ActraiserDrop' },
        { label: 'LogoSplash', value: 'LogoSplash' },
      ],
      defaultValue: 'ActraiserDrop',
    }),
    rotationSpeed: Number({
      label: 'Rotation (deg) - ActraiserDrop',
      defaultValue: 360,
      step: 90,
    }),
    zoomScale: Number({
      label: 'Zoom Scale - ActraiserDrop',
      defaultValue: 2,
      step: 0.5,
    }),
    transitionDuration: Number({
      label: 'Duration (s)',
      defaultValue: 1,
      step: 0.1,
    }),
    gradientStart: Color({
      label: 'Gradient Start - LogoSplash',
      defaultValue: '#00ffff',
    }),
    gradientEnd: Color({
      label: 'Gradient End - LogoSplash',
      defaultValue: '#ffd700',
    }),
    splashScale: Number({
      label: 'Splash Scale - LogoSplash',
      defaultValue: 3,
      step: 0.5,
    }),
    animatedPathId: TextInput({
      label: "Path IDs - LogoSplash",
      description: "Comma-separated IDs, 'all', or 'none'",
      defaultValue: 'all',
    }),
    splashImage: Image({
      label: 'Splash SVG - LogoSplash',
      description: 'Optional: select an SVG file to use for LogoSplash',
      format: Image.Format.URL,
    }),
    strokeWidth: Number({
      label: 'Stroke Width - LogoSplash',
      defaultValue: 3,
      step: 1,
    }),
  },
})