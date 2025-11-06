"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // Start on path change
    setVisible(true);
    setWidth(10);

    // Fake progress to 80%
    timer.current && window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setWidth((w) => (w < 80 ? Math.min(80, w + Math.random() * 10) : w));
    }, 200);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    // Complete shortly after mount of new route
    const complete = window.setTimeout(() => {
      setWidth(100);
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 200);
    }, 350);
    return () => window.clearTimeout(complete);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] bg-transparent"
    >
      <div
        className="h-full bg-primary-500 transition-[width] duration-md ease-in-out-token"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

