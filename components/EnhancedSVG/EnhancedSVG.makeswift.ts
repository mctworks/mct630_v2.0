// EnhancedSVG.makeswift.ts
import { runtime } from '@/lib/makeswift/runtime'
import { 
  Style, 
  Image, 
  Color, 
  Number, 
  Checkbox,
  TextInput
} from '@makeswift/runtime/controls'
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
    lightFillColor: Color({
      label: 'Light Theme Fill',
      defaultValue: '#000000',
    }),
    darkFillColor: Color({
      label: 'Dark Theme Fill',
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
      label: 'Animation Duration (seconds)',
      defaultValue: 2,
      min: 0.5,
      max: 10,
      step: 0.1,
    }),
    resetDuration: Number({
      label: 'Reset Speed (0.1-1.0)',
      description: 'Lower values = faster reset animation',
      defaultValue: 0.3,
      min: 0.1,
      max: 1.0,
      step: 0.1,
    }),
    logoStrokeWidth: Number({
      label: 'Stroke Width',
      defaultValue: 2,
      min: 0.5,
      max: 10,
      step: 0.1,
    }),
    animatePaths: TextInput({
      label: 'Paths to animate',
      description: 'Use "all" for entire SVG, "none" to skip path drawing, or specific element IDs',
      defaultValue: 'all',
    }),
  },
})