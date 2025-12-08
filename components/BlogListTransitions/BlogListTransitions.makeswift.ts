import { lazy } from 'react'
import { Style, Checkbox, TextInput, Number, Select, Color, Image, Slot } from '@makeswift/runtime/controls'
import { runtime } from '@/lib/makeswift/runtime'

runtime.registerComponent(
  lazy(() => import('./BlogListTransitions')),
  {
    type: 'blog-list-transitions',
    label: 'Custom/Blog List Transitions',
    //hidden: true,
    description: 'Configure transition animation settings for blog post lists',
    props: {
      enableTransitions: Checkbox({
        label: 'Enable Transitions',
        defaultValue: true,
      }),
      className: Style({ properties: [Style.Width] }),
      containerClassName: Style({ properties: Style.All }),
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
  },
)
