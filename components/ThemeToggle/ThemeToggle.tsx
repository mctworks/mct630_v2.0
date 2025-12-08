"use client"
import { useTheme } from '@/components/ThemeConfig/ThemeConfig'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle" 
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <img src="/icons/mct630-light.svg" alt="Light mode icon" width={36} height={36} />
      ) : (
        <img src="/icons/mct630-dark.svg" alt="Dark mode icon" width={36} height={36} />
      )}
    </button>
  )
}