/*EnhancedSVG.makeswift.ts*/
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
    className: Style(), // This automatically enables all style controls
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
      label: 'Animation Duration (seconds)',
      defaultValue: 2,
      min: 0.5,
      max: 10,
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
      description: 'Comma-separated IDs (frame,line1,etc) or "all" for entire SVG',
      defaultValue: 'all',
    }),
  },
})