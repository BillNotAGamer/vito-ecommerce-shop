"use client";

import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down" | "none";

export function useScrollDirection(threshold = 6) {
  const [direction, setDirection] = useState<ScrollDirection>("none");
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const diff = Math.abs(y - lastY.current);
      if (diff < threshold) return;
      setDirection(y > lastY.current ? "down" : "up");
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
}

