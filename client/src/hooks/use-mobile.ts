import * as React from "react"

const MOBILE_BREAKPOINT = 768
/** Sidebar uses a drawer below this width (phones + tablets). */
export const SIDEBAR_COMPACT_BREAKPOINT = 1024

function useMediaQuery(maxWidth: number) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`)
    const onChange = () => {
      setMatches(window.innerWidth < maxWidth)
    }
    mql.addEventListener("change", onChange)
    setMatches(window.innerWidth < maxWidth)
    return () => mql.removeEventListener("change", onChange)
  }, [maxWidth])

  return !!matches
}

export function useIsMobile() {
  return useMediaQuery(MOBILE_BREAKPOINT)
}

export function useIsCompactSidebar() {
  return useMediaQuery(SIDEBAR_COMPACT_BREAKPOINT)
}
