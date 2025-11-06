"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export type ThemeMode = "system" | "light" | "dark";
export type ThemePreset = "aurora" | "noir";

export const motion = {
  duration: {
    xs: 100,
    sm: 150,
    md: 200,
    lg: 300,
    xl: 500,
  },
  ease: {
    in: [0.4, 0, 1, 1] as [number, number, number, number],
    out: [0, 0, 0.2, 1] as [number, number, number, number],
    inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  springs: {
    subtle: { type: "spring", mass: 0.6, stiffness: 220, damping: 22 } as const,
    default: { type: "spring", mass: 1, stiffness: 260, damping: 24 } as const,
    heavy: { type: "spring", mass: 1.2, stiffness: 320, damping: 28 } as const,
  },
} as const;

export function ThemeProvider(props: React.PropsWithChildren<{ attribute?: "class" | "data-theme"; defaultTheme?: ThemeMode }>) {
  const { children, attribute = "class", defaultTheme = "system" } = props;
  return (
    <NextThemesProvider attribute={attribute} defaultTheme={defaultTheme} enableSystem>
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const t = useNextTheme();
  return t;
}

/* Presets (Aurora/Noir), toggled by adding a class to <html>. */
export function getCurrentPreset(): ThemePreset {
  if (typeof document === "undefined") return "aurora";
  const el = document.documentElement;
  return el.classList.contains("theme-noir") ? "noir" : "aurora";
}

export function setPreset(preset: ThemePreset) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.toggle("theme-noir", preset === "noir");
  el.classList.toggle("theme-aurora", preset === "aurora");
}

export function toggleHighContrast(enabled?: boolean) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (typeof enabled === "boolean") {
    el.classList.toggle("hc", enabled);
  } else {
    el.classList.toggle("hc");
  }
}

export function getSystemMode(): Exclude<ThemeMode, "system"> {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

