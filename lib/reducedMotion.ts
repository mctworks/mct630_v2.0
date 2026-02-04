export type ReducedMotionSetting = 'reduced' | 'standard' | 'system'

const STORAGE_KEY = 'mct630.reducedMotion'
const WINDOW_KEY = '__MCT630_REDUCED_MOTION_OVERRIDE'

export function getStoredSetting(): ReducedMotionSetting | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (!v) return null
    if (v === 'reduced' || v === 'standard' || v === 'system') return v
    return null
  } catch (e) {
    return null
  }
}

export function setStoredSetting(value: ReducedMotionSetting | null) {
  if (typeof window === 'undefined') return
  try {
    if (!value || value === 'system') {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, value)
    }

    // Expose a quick global for other scripts to check
    ;(window as any)[WINDOW_KEY] = value || 'system'

    // Also set a data attribute so CSS or other code can read it
    try {
      if (value && value !== 'system') {
        document.documentElement.setAttribute('data-reduced-motion-override', value)
      } else {
        document.documentElement.removeAttribute('data-reduced-motion-override')
      }
    } catch (err) {
      // ignore
    }

    // Dispatch an event so other components can listen and update
    try {
      window.dispatchEvent(new CustomEvent('mct630:reduced-motion-change', { detail: { setting: value || 'system' } }))
    } catch (err) {
      // ignore
    }
  } catch (e) {
    // ignore storage errors
  }
}

export function getEffectivePrefersReduced(): boolean {
  if (typeof window === 'undefined') return false
  const stored = getStoredSetting()
  if (stored === 'reduced') return true
  if (stored === 'standard') return false

  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (err) {
    return false
  }
}

export function getSystemPrefersReduced(): boolean {
  if (typeof window === 'undefined') return false
  try {
    // Make sure we're getting the fresh value every time
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (err) {
    console.warn('Error checking prefers-reduced-motion:', err)
    return false
  }
}