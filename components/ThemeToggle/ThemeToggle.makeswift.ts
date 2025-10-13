import { runtime } from '@/lib/makeswift/runtime'
import { ThemeToggle } from './ThemeToggle'

runtime.registerComponent(ThemeToggle, {
  type: 'theme-toggle',
  label: 'Theme Toggle',
  props: {},
})