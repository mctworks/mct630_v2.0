'use client'
import { useTheme } from '@/components/ThemeConfig/ThemeConfig'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  )
}