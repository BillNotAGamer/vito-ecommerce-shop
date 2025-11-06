"use client";

import { useEffect, useRef, useState } from "react";

export function useInViewOnce<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInView(true);
          o.disconnect();
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1, ...(options || {}) });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [options, inView]);

  return { ref, inView } as const;
}

