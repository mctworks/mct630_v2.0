import { lazy } from 'react'
import { Style, Link, Number, Slot } from '@makeswift/runtime/controls'
import { runtime } from '@/lib/makeswift/runtime'

runtime.registerComponent(
  lazy(() => import('./ActraiserFall')),
  {
    type: 'element',
    label: 'Custom/Actraiser Fall',
    props: {
      children: Slot(),
      href: Link({ label: 'Link' }),
      className: Style({ properties: [Style.Width] }),
      containerClassName: Style({ properties: Style.All }),
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
    },
  },
)