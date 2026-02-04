/*tsx for Makeswift component: MotionToggle.tsx*/
'use client'
import { useEffect, useState, useCallback } from 'react'
import { getStoredSetting, setStoredSetting, getEffectivePrefersReduced, getSystemPrefersReduced, ReducedMotionSetting } from '@/lib/reducedMotion'

export default function MotionToggle() {
  const [effectiveReduced, setEffectiveReduced] = useState<boolean>(false)
  const [stored, setStored] = useState<ReducedMotionSetting | null>(null)
  const [systemPrefersReduced, setSystemPrefersReduced] = useState<boolean>(false)
  const [isClient, setIsClient] = useState(false)

  // Initialize state on client side only
  useEffect(() => {
    setIsClient(true)
    setEffectiveReduced(getEffectivePrefersReduced())
    setStored(getStoredSetting())
    setSystemPrefersReduced(getSystemPrefersReduced())
  }, [])

  useEffect(() => {
    const handler = () => {
      setEffectiveReduced(getEffectivePrefersReduced())
      setStored(getStoredSetting())
      setSystemPrefersReduced(getSystemPrefersReduced())
    }

    // Listen for storage changes and custom events
    window.addEventListener('storage', handler)
    window.addEventListener('mct630:reduced-motion-change', handler as EventListener)

    // Listen for system preference changes
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onChange = () => {
        setSystemPrefersReduced(getSystemPrefersReduced())
        // Also update effectiveReduced based on new system preference
        setEffectiveReduced(getEffectivePrefersReduced())
      }
      
      if ('addEventListener' in mq) {
        mq.addEventListener('change', onChange)
      } else if ('addListener' in mq) {
        (mq as any).addListener(onChange)
      }

      return () => {
        window.removeEventListener('storage', handler)
        window.removeEventListener('mct630:reduced-motion-change', handler as EventListener)
        if ('removeEventListener' in mq) {
          mq.removeEventListener('change', onChange)
        } else if ('removeListener' in mq) {
          (mq as any).removeListener(onChange)
        }
      }
    } catch (err) {
      console.warn('Media query listener not supported:', err)
      return () => {
        window.removeEventListener('storage', handler)
        window.removeEventListener('mct630:reduced-motion-change', handler as EventListener)
      }
    }
  }, [])

  const toggle = useCallback(() => {
    // Get fresh values to avoid stale state
    const currentStored = getStoredSetting()
    const currentEffective = getEffectivePrefersReduced()
    
    let next: ReducedMotionSetting
    
    if (currentStored === 'reduced') {
      next = 'standard'
    } else if (currentStored === 'standard') {
      next = 'reduced'
    } else {
      // No stored setting, so we're using system preference
      // Toggle to the opposite of system preference
      const systemReduced = getSystemPrefersReduced()
      next = systemReduced ? 'standard' : 'reduced'
    }
    
    setStoredSetting(next)
    // Update state immediately
    setStored(next)
    setEffectiveReduced(getEffectivePrefersReduced())
  }, [])

  // Don't render anything during SSR or before client initialization
  if (!isClient) {
    return null
  }

  // Hide the toggle if system prefers reduced AND user hasn't overridden it
  if (systemPrefersReduced && !stored) {
    return null
  }

  const ariaLabel = stored
    ? `Motion override: ${stored}. Click to toggle between reduced and standard motion.`
    : `Using system preference (${systemPrefersReduced ? 'reduced' : 'standard'}). Click to set override.`

  return (
    <div className="motion-toggle inline-flex items-center gap-2">
      <button
        aria-pressed={effectiveReduced}
        onClick={toggle}
        title="Toggle reduced-motion"
        aria-label={ariaLabel}
        className="p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      >
        {effectiveReduced ? (
          <img 
            src="/icons/MCT630_reduced_motion_icon.v.1.0.svg" 
            alt="Reduced motion" 
            width={36} 
            height={36}
            className="motion-icon"
          />
        ) : (
          <img 
            src="/icons/MCT630_standard_motion_icon.v.1.0.svg" 
            alt="Standard motion" 
            width={36} 
            height={36}
            className="motion-icon"
          />
        )}
      </button>
    </div>
  )
}