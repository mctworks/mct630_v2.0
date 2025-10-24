import { runtime } from '@/lib/makeswift/runtime'
import { Style, Image, Color, Number, Checkbox } from '@makeswift/runtime/controls'
import { EnhancedSVG } from './EnhancedSVG'

runtime.registerComponent(EnhancedSVG, {
  type: 'enhanced-svg',
  label: 'Enhanced SVG',
  props: {
    className: Style(),
    svg: Image({
      label: 'SVG File',
      format: Image.Format.WithDimensions,
    }),
    lightStrokeColor: Color({
      label: 'Light Theme Stroke',
      defaultValue: '#000000',
    }),
    darkStrokeColor: Color({
      label: 'Dark Theme Stroke',
      defaultValue: '#ffffff',
    }),
    enableGradientDraw: Checkbox({
      label: 'Enable Gradient Animation',
      defaultValue: false,
    }),
    gradientStartColor: Color({
      label: 'Gradient Start Color',
      defaultValue: '#000000',
    }),
    gradientEndColor: Color({
      label: 'Gradient End Color',
      defaultValue: '#ffffff',
    }),
    gradientDuration: Number({
      label: 'Gradient Animation Duration',
      defaultValue: 2,
      min: 0.5,
      max: 10,
      step: 0.1,
    }),
  },
})