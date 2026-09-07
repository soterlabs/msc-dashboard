import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

/**
 * shadcn ships this as a `useState` + `useEffect` pair that writes the first
 * measurement from inside the effect, which the project's lint rules reject
 * (react-hooks/set-state-in-effect). `useSyncExternalStore` expresses the same
 * thing as what it actually is — a subscription to a browser media query — and
 * keeps the server snapshot explicit, so the markup rendered on the server is
 * the desktop one.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
