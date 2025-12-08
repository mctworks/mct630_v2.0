import { lazy } from 'react'
import { Style, Link, Number, Select, Slot, Color, Image, TextInput } from '@makeswift/runtime/controls'
import { runtime } from '@/lib/makeswift/runtime'

runtime.registerComponent(
  lazy(() => import('./TransitionLink').then(m => ({ default: m.TransitionLink }))),  
  {
    type: 'transition-link',
    label: 'Custom/Transition Link',
    props: {
      children: Slot(),
      href: Link({ label: 'Link' }),
      className: Style({ properties: [Style.Width] }),
      containerClassName: Style({ properties: Style.All }),
      animationType: Select({
        label: 'Animation Type',
        options: [
          { label: 'Actraiser Drop', value: 'ActraiserDrop' },
          { label: 'Logo Splash', value: 'LogoSplash' },
        ],
        defaultValue: 'ActraiserDrop',
      }),
      rotationSpeed: Number({
        label: 'Rotation (deg)',
        defaultValue: 360,
        step: 90,
      }),
      zoomScale: Number({
        label: 'Zoom Scale',
        defaultValue: 2,
        step: 0.5,
      }),
      transitionDuration: Number({
        label: 'In Duration (s)',
        defaultValue: 1,
        step: 0.1,
      }),
      fadeOutDuration: Number({
        label: 'Out Duration (s)',
        defaultValue: 0.5,
        step: 0.1,
      }),
      splashImage: Image({
        label: 'Splash Image (LogoSplash)',
      }),
      gradientStart: Color({
        label: 'Gradient Start Color',
        defaultValue: '#00ffff',
      }),
      gradientEnd: Color({
        label: 'Gradient End Color',
        defaultValue: '#ffd700',
      }),
      splashScale: Number({
        label: 'Splash Scale',
        defaultValue: 3,
        step: 0.5,
      }),
      animatedPathId: TextInput({
            label: 'Paths to animate',
            description: 'Use "all" for entire SVG, "none" to skip path drawing, or specific element IDs',
            defaultValue: 'all',
      }),
      strokeWidth: Number({
        label: 'Stroke Width',
        defaultValue: 3,
        step: 0.5,
      }),
    },
  },
)
