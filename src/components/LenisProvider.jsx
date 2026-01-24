// src/components/LenisProvider.jsx

import { useEffect, useState, useRef } from "react";
import { LenisContext } from "./LenisContext";
import Lenis from "lenis";

function LenisProvider({ children }) {
  // Initialize Lenis in state directly (lazy initializer)
  const [lenisInstance] = useState(() => {
    if (typeof window === "undefined") return null;
    return new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });
  });
  const lenisRef = useRef(lenisInstance);

  // Keep ref in sync
  useEffect(() => {
    lenisRef.current = lenisInstance;
  }, [lenisInstance]);

  useEffect(() => {
    if (!lenisInstance) return;

    const raf = (time) => {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    };
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
    };
  }, [lenisInstance]);

  if (!lenisInstance) {
    return null;
  }

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}

export default LenisProvider;
