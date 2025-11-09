'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  colors: {
    background: string
    menubg?: string
    navglow1?: string
    navglow2?: string
    navglow3?: string
    navglow4?: string
    text: string
    primary: string
    secondary: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeConfigProps {
  children?: ReactNode
  // Light theme colors
  lightBackground?: string
  lightMenuBG?: string
  lightNavGlow1?: string
  lightNavGlow2?: string
  lightNavGlow3?: string
  lightNavGlow4?: string
  lightText?: string
  lightSubtext?: string
  lightPrimary?: string
  lightSecondary?: string
  // Dark theme colors
  darkBackground?: string
  darkMenuBG?: string
  darkNavGlow1?: string
  darkNavGlow2?: string
  darkNavGlow3?: string
  darkNavGlow4?: string
  darkText?: string
  darkSubtext?: string
  darkPrimary?: string
  darkSecondary?: string
}

export function ThemeConfig({
  children,
  lightBackground = '#e8f0f3e0',
  lightMenuBG = '#ffffff',
  lightNavGlow1 = '#b3b3b3ff',
  lightNavGlow2 = '#b3b3b1ff',
  lightNavGlow3 = 'rgba(0, 0, 0, 0.6)',
  lightNavGlow4 = 'rgba(0, 0, 0, 0.4)',
  lightText = '#000000',
  lightSubtext = '#4d464cff',
  lightPrimary = '#0068ffdb',
  lightSecondary = '#4a4a4a',
  darkMenuBG = "#000000",
  darkNavGlow1 = '#4d4d4dff',
  darkNavGlow2 = '#808080ff',
  darkNavGlow3 = 'rgba(255, 255, 255, 0.6)',
  darkNavGlow4 = 'rgba(255, 255, 255, 0.4)',
  darkBackground = '#1d1c24ff',
  darkText = '#ffffff',
  darkSubtext = '#b9a9c0ff',
  darkPrimary = '#0068ffdb',
  darkSecondary = '#908fa0ff'
}: ThemeConfigProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setMounted(true)
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches)
      }
    }

    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
    } else {
      setIsDark(prefersDark.matches)
    }

    prefersDark.addEventListener('change', handleSystemThemeChange)
    return () => prefersDark.removeEventListener('change', handleSystemThemeChange)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const colors = isDark 
      ? {
          background: darkBackground,
          text: darkText,
          subtext: darkSubtext,
          primary: darkPrimary,
          secondary: darkSecondary,
          menubg: darkMenuBG,
          navglow1: darkNavGlow1,
          navglow2: darkNavGlow2,
          navglow3: darkNavGlow3,
          navglow4: darkNavGlow4,
        }
      : {
          background: lightBackground,
          text: lightText,
          subtext: lightSubtext,
          primary: lightPrimary,
          secondary: lightSecondary,
          menubg: lightMenuBG,
          navglow1: lightNavGlow1,
          navglow2: lightNavGlow2,
          navglow3: lightNavGlow3,
          navglow4: lightNavGlow4,
        }

    // Apply colors as CSS variables with !important
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value, 'important')
    })

    // Create a style element for global overrides
    let styleEl = document.getElementById('theme-styles')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'theme-styles'
      document.head.appendChild(styleEl)
    }

    // Apply global styles with high specificity - target all elements
    styleEl.textContent = `
  @layer overrides {
  /* Force all elements to inherit color */
  * {
    color: inherit !important;
  }
  
  /* Set the base text color */
  body, html {
    color: ${colors.text} !important;
    background-color: ${colors.background} !important;
  }
  
  /* Target headings specifically */
  h1, h2, h3, h4, h5, h6,
  [data-makeswift-component-type="text"] h1,
  [data-makeswift-component-type="text"] h2,
  [data-makeswift-component-type="text"] h3, {
    color: ${colors.text} !important;
  }

  [data-makeswift-component-type="text"] h4,
  [data-makeswift-component-type="text"] h5,
  [data-makeswift-component-type="text"] h6 {
    color: ${colors.subtext} !important;
  }
  
  /* Target all Makeswift components */
  [data-makeswift-component-type] {
    color: ${colors.text} !important;
  }

  /* Target Makeswift's main containers */
  main, [data-makeswift-component-type],
  [data-makeswift-component-type="box"],
  [data-makeswift-component-type="slot"],
  div[class*="makeswift"] {
    background-color: ${colors.background} !important;
  }

  div[class^="mswft-"]:not([style*="background-color"]) {
  background-color: ${colors.background} !important;
}

/* This rule ensures the pattern shapes (e.g., dots/lines inside the pattern definition) 
   are colored using the theme color defined by the JS. */
.enhanced-svg-container .svg-pattern-shape {
    fill: var(--svg-line-color, #000); /* Use the CSS variable */
    stroke: var(--svg-line-color, #000);
}


  /* Nuclear option */
div:not([style*="background"]):not(.outer-container):not(.bm-menu):not(.nav-status-box):not(.#nav-status > div) {
  background-color: ${colors.background} !important;
}

.outer-container {
  background-color: ${colors.menubg} !important;
}

.bm-menu {
  background: ${colors.primary} !important;
  border: ${colors.text} 1px solid !important;
  color: "#ffffff" !important;
}

.nav-status-box {
  background-color: ${colors.menubg} !important;
}

.nav-status-text {
    text-shadow: 1px 0 1px ${colors.navglow1}, 
  0 -1px 1px ${colors.navglow2}, 
  -5px 4px 15px ${colors.navglow3}, 
  -3px -2px 2px ${colors.navglow4}
}

.#nav-status > div{
    background-color: ${colors.menubg} !important;
}

}
`

    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    
    // Toggle classes for additional styling hooks
    root.classList.toggle('dark', isDark)
    root.classList.toggle('light', !isDark)
  }, [
    mounted,
    isDark,
    lightBackground, lightText, lightPrimary, lightSecondary, lightMenuBG,
    darkBackground, darkText, darkPrimary, darkSecondary, darkMenuBG
  ])

  const toggleTheme = () => setIsDark(prev => !prev)
  
  const colors = isDark 
    ? {
        background: darkBackground,
        menubg: darkMenuBG,
        navglow1: darkNavGlow1,
        navglow2: darkNavGlow2,
        navglow3: darkNavGlow3,
        navglow4: darkNavGlow4,
        text: darkText,
        primary: darkPrimary,
        secondary: darkSecondary,
      }
    : {
        background: lightBackground,
        menubg: lightMenuBG,
        navglow1: lightNavGlow1,
        navglow2: lightNavGlow2,
        navglow3: lightNavGlow3,
        navglow4: lightNavGlow4,
        text: lightText,
        primary: lightPrimary,
        secondary: lightSecondary,
      }

  // Prevent flash of wrong theme
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeConfig