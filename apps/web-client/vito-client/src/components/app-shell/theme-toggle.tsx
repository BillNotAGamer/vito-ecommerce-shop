"use client";

import { useEffect, useMemo, useState } from "react";
import { MonitorIcon, MoonIcon, SunIcon, HighlighterIcon, PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ThemeMode, useTheme, setPreset, getCurrentPreset, toggleHighContrast } from "@/lib/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [preset, setPresetState] = useState(getCurrentPreset());
  const [hc, setHc] = useState<boolean>(false);

  useEffect(() => {
    // sync initial
    setPresetState(getCurrentPreset());
    setHc(document.documentElement.classList.contains("hc"));
  }, []);

  const icon = useMemo(() => {
    const mode = (theme === "system" ? systemTheme : theme) as ThemeMode | undefined;
    if (mode === "dark") return <MoonIcon className="size-4" />;
    if (mode === "light") return <SunIcon className="size-4" />;
    return <MonitorIcon className="size-4" />;
  }, [theme, systemTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("size-9", className)}>
          {icon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="type-small">Theme</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="type-small flex items-center gap-2">
          <PaletteIcon className="size-3.5" /> Preset
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={preset === "aurora"}
          onCheckedChange={(v) => {
            if (v) {
              setPreset("aurora");
              setPresetState("aurora");
            }
          }}
        >
          Aurora
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={preset === "noir"}
          onCheckedChange={(v) => {
            if (v) {
              setPreset("noir");
              setPresetState("noir");
            }
          }}
        >
          Noir
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          onCheckedChange={(v) => {
            toggleHighContrast(!!v);
            setHc(!!v);
          }}
          checked={hc}
        >
          <span className="inline-flex items-center gap-2">
            <HighlighterIcon className="size-3.5" /> High contrast
          </span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

