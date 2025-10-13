interface ThemeControlsProps {
  lightBackground?: string
  lightText?: string
  lightPrimary?: string
  lightSecondary?: string
  darkBackground?: string
  darkText?: string
  darkPrimary?: string
  darkSecondary?: string
}

export function ThemeControls(props: ThemeControlsProps) {
  // This component doesn't render anything visible
  // It just exists to provide theme controls in the builder
  return null
}