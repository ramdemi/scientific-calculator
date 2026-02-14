import { useState, useEffect, Reference, RefObject } from "react";

/**
 * Custom hook to track window size changes
 * @param {number} delay - debounce delay in ms (default: 150ms)
 */
export function useWindowSize(delay = 150) {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safety
    let timeoutId = 0;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        console.log(timeoutId);
        clearTimeout(timeoutId);
        //
      }, delay);
    };

    window.addEventListener("resize", handleResize);

    // Initial call to set size
    //handleResize();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}
