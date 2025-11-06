"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function SpotlightCursor({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [onMove]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, color-mix(in oklch, var(--ring) 15%, transparent), transparent 60%)`,
      }}
    />
  );
}

export function GradientMesh({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("absolute inset-0 -z-10 overflow-hidden blur-2xl", className)}>
      <div className="absolute -top-24 -left-16 size-[40rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,theme(colors.primary.400/.35),transparent_60%)] animate-[spin_60s_linear_infinite]" />
      <div className="absolute -bottom-32 -right-16 size-[40rem] rounded-full bg-[radial-gradient(circle_at_70%_70%,theme(colors.accent.400/.35),transparent_60%)] animate-[spin_80s_linear_infinite_reverse]" />
      <div className="absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_90deg,_theme(colors.primary.400/.15),_theme(colors.accent.400/.15),_transparent_60%)]" />
    </div>
  );
}

export function NoiseOverlay({ className }: { className?: string }) {
  // Subtle noise via SVG turbulence (data URI). Works in modern browsers.
  const svgData = useMemo(
    () =>
      `url("data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
          <filter id='n'>
            <feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='1' stitchTiles='stitch'/>
            <feColorMatrix type='saturate' values='0'/>
          </filter>
          <rect width='100%' height='100%' filter='url(%23n)' opacity='0.04'/>
        </svg>`
      )}")`,
    []
  );
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 mix-blend-overlay", className)}
      style={{ backgroundImage: svgData }}
    />
  );
}

