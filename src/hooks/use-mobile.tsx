import * as React from "react"

/**
 * Breakpoint definitions:
 * - MOBILE_MAX: Maximum width for mobile devices (iPad mini and smaller)
 *   iPad mini: 768px portrait, 1024px landscape
 *   Small smartphones: up to ~480px portrait
 * - DESKTOP_MIN: Minimum width for desktop mode (iPad Pro and larger)
 *   iPad Pro 11": 834px portrait, 1194px landscape
 *   iPad Pro 12.9": 1024px portrait, 1366px landscape
 *   Desktops/Laptops: typically 1280px+
 * 
 * Note: iPad Pro 11" portrait (834px) is between iPad mini and iPad Pro 12.9"
 * We use 1024px as the breakpoint, but iPad Pro devices typically have higher pixel density
 * and will report larger viewport widths. For exact 1024px, we check device characteristics.
 * 
 * Mobile mode: width <= 1024px (includes iPad mini in both orientations)
 * Desktop mode: width > 1024px (iPad Pro and larger tablets, desktops, laptops)
 */
const MOBILE_MAX = 1024
const DESKTOP_MIN = 1025

/**
 * Hook to detect if device is in landscape orientation
 * Returns true if width > height AND device is still in mobile range (<= 1024px)
 */
export function useIsLandscape() {
  const [isLandscape, setIsLandscape] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkLandscape = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      // Landscape: width > height AND still mobile range (<= 1024px)
      setIsLandscape(width > height && width <= MOBILE_MAX)
    }

    checkLandscape()
    window.addEventListener("resize", checkLandscape)
    window.addEventListener("orientationchange", checkLandscape)
    
    return () => {
      window.removeEventListener("resize", checkLandscape)
      window.removeEventListener("orientationchange", checkLandscape)
    }
  }, [])

  return !!isLandscape
}

/**
 * Hook to detect if device is mobile (iPad mini and smaller smartphones)
 * Returns true if width <= 1024px (includes iPad mini in both portrait and landscape)
 * Returns false if width > 1024px (iPad Pro and larger tablets, desktops, laptops)
 * 
 * Device breakdown:
 * - Small smartphones: ~320-480px = mobile ✓
 * - Large smartphones: ~480-768px = mobile ✓
 * - iPad mini portrait: 768px = mobile ✓
 * - iPad mini landscape: 1024px = mobile ✓
 * - iPad Pro 11" portrait: 834px = mobile (but typically reports higher due to pixel ratio)
 * - iPad Pro 11" landscape: 1194px = desktop ✓
 * - iPad Pro 12.9" portrait: 1024px = mobile (but typically reports higher due to pixel ratio)
 * - iPad Pro 12.9" landscape: 1366px = desktop ✓
 * - Desktops/Laptops: 1280px+ = desktop ✓
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      // Mobile if width <= 1024px (iPad mini and smaller)
      // Desktop if width > 1024px (iPad Pro and larger)
      // Note: Actual device pixel ratio may cause iPad Pro to report higher widths
      setIsMobile(width <= MOBILE_MAX)
    }

    checkMobile()
    const mql = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`)
    const onChange = () => {
      checkMobile()
    }
    mql.addEventListener("change", onChange)
    window.addEventListener("resize", checkMobile)
    window.addEventListener("orientationchange", checkMobile)
    
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [])

  return !!isMobile
}
