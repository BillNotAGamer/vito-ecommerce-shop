import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/(app)/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "clamp(1rem, 0.75rem + 2vw, 2rem)",
        sm: "clamp(1rem, 0.75rem + 2vw, 2rem)",
        md: "clamp(1rem, 0.75rem + 2vw, 3rem)",
        lg: "clamp(1rem, 0.75rem + 2vw, 4rem)",
        xl: "clamp(1rem, 0.75rem + 2vw, 5rem)",
      },
    },
    extend: {},
  },
  safelist: [
    // Color roles and steps commonly used by shadcn/ui + app
    {
      pattern:
        /(bg|text|border|ring|stroke|fill)-(primary|secondary|accent|neutral|success|warning|destructive)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: [
        "hover",
        "focus",
        "active",
        "disabled",
        "dark",
        "hc",
      ],
    },
    // Foreground pairing
    {
      pattern: /(bg|text)-(background|foreground|muted|muted-foreground)/,
      variants: ["dark", "hc"],
    },
    // Rings used by focus-visible/radix states
    {
      pattern: /(ring|ring-offset)-(0|1|2|4|8)/,
    },
    // Data/aria state variants used by shadcn
    "data-[state=open]:bg-accent",
    "data-[state=on]:bg-primary",
    "data-[selected=true]:bg-accent",
    "aria-[expanded=true]:bg-accent",
    "aria-[selected=true]:bg-accent",
  ],
  plugins: [
    // Custom variants for high-contrast and theme presets
    plugin(({ addVariant }) => {
      addVariant("hc", ".hc &");
      addVariant("theme-aurora", ".theme-aurora &");
      addVariant("theme-noir", ".theme-noir &");
    }),
    // Utilities: elevation, glass, backdrop, perspective (JS API companion to CSS @utility)
    plugin(({ matchUtilities, addUtilities, theme }) => {
      matchUtilities(
        {
          "shadow-elevation": (value) => ({ boxShadow: `var(--shadow-${value})` }),
        },
        { values: { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" } }
      );

      addUtilities({
        ".glass": {
          background: "color-mix(in oklch, var(--background) 75%, transparent)",
          border: "1px solid color-mix(in oklch, var(--border) 60%, transparent)",
          backdropFilter: "blur(var(--blur-3)) saturate(1.1)",
        },
        ".backdrop-soft": {
          backdropFilter: "blur(var(--blur-2)) saturate(1.05)",
        },
        ".backdrop-strong": {
          backdropFilter: "blur(var(--blur-4)) saturate(1.15)",
        },
        ".perspective-800": { perspective: "800px" },
        ".perspective-1000": { perspective: "1000px" },
        ".preserve-3d": { transformStyle: "preserve-3d" },
        ".backface-hidden": { backfaceVisibility: "hidden" },
      });
    }),
  ],
} satisfies Config;

