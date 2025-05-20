"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatches = () => setMatches(media.matches);
    
    // Set initial state
    updateMatches();
    
    // Listen for changes
    media.addEventListener("change", updateMatches);
    
    // Clean up the listener on unmount
    return () => {
      media.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}