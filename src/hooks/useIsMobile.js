// src/hooks/useIsMobile.js
import { useState, useEffect } from "react";

/**
 * useIsMobile
 * Reactive hook to detect if the user's viewport is mobile (<= breakpoint px).
 * Default breakpoint: 840px (covers all smartphones and small portrait tablets).
 */
export default function useIsMobile(breakpoint = 840) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const updateMatches = (e) => {
      setIsMobile(e.matches);
    };

    // Set initial
    setIsMobile(mediaQuery.matches);

    // Modern listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMatches);
      return () => mediaQuery.removeEventListener("change", updateMatches);
    } else {
      // Fallback for older WebViews
      mediaQuery.addListener(updateMatches);
      return () => mediaQuery.removeListener(updateMatches);
    }
  }, [breakpoint]);

  return isMobile;
}
