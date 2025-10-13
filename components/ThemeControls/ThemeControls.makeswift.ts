import { Color } from '@makeswift/runtime/controls'
import { runtime } from '@/lib/makeswift/runtime'
import { ThemeControls } from './ThemeControls'

runtime.registerComponent(ThemeControls, {
  type: 'theme-controls',
  label: 'Theme Controls',
  props: {
    lightBackground: Color({
      label: 'Light Background',
      defaultValue: '#ffffff',
    }),
    lightText: Color({
      label: 'Light Text',
      defaultValue: '#000000',
    }),
    lightPrimary: Color({
      label: 'Light Primary',
      defaultValue: '#1a1a1a',
    }),
    lightSecondary: Color({
      label: 'Light Secondary',
      defaultValue: '#4a4a4a',
    }),
    darkBackground: Color({
      label: 'Dark Background',
      defaultValue: '#1a1a1a',
    }),
    darkText: Color({
      label: 'Dark Text',
      defaultValue: '#ffffff',
    }),
    darkPrimary: Color({
      label: 'Dark Primary',
      defaultValue: '#ffffff',
    }),
    darkSecondary: Color({
      label: 'Dark Secondary',
      defaultValue: '#cccccc',
    }),
  },
})