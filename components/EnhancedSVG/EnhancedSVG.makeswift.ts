import { runtime } from '@/lib/makeswift/runtime'
import {
  Style,
  Image,
  Link,
  Color,
  Number,
  Select,
  Checkbox,
} from '@makeswift/runtime/controls'
import EnhancedSVG from './EnhancedSVG'

runtime.registerComponent(EnhancedSVG, {
  type: 'enhanced-svg',
  label: 'Enhanced SVG',
  props: {
    className: Style(),
    svg: Image({
      label: 'SVG File',
      format: Image.Format.WithDimensions,
    }),
    lightFillColor: Color({
      label: 'Light Mode Fill',
      defaultValue: '#000000',
    }),
    darkFillColor: Color({
      label: 'Dark Mode Fill',
      defaultValue: '#ffffff',
    }),
    link: Link({ label: 'Link' }),
    transitionEffect: Select({
      label: 'Transition Effect',
      options: [
        { value: 'none', label: 'No Transition' },
        { value: 'screentone-top', label: 'Screentone (Top to Bottom)' },
        { value: 'screentone-bottom', label: 'Screentone (Bottom to Top)' },
      ],
      defaultValue: 'none',
    }),
    transitionDuration: Number({
      label: 'Transition Duration (s)',
      defaultValue: 1.5,
      step: 0.1,
      min: 0,
    }),
    enableGradientDraw: Checkbox({
      label: 'Enable GSAP Gradient Draw',
      defaultValue: false,
    }),
  },
})