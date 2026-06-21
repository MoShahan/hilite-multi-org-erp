import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const TRACK_WIDTH = 56;
const KNOB_SIZE = 36;
const ANIMATION_MS = 350;

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const themeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(
    () => () => {
      if (themeTimeoutRef.current !== null) {
        window.clearTimeout(themeTimeoutRef.current);
      }
    },
    [],
  );

  if (!mounted) {
    return (
      <div className="px-2 py-1" aria-hidden>
        <div
          className="h-8 rounded-full bg-muted/40"
          style={{ width: TRACK_WIDTH }}
        />
      </div>
    );
  }

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);

    if (themeTimeoutRef.current !== null) {
      window.clearTimeout(themeTimeoutRef.current);
    }

    themeTimeoutRef.current = window.setTimeout(() => {
      setTheme(next ? "dark" : "light");
      themeTimeoutRef.current = null;
    }, ANIMATION_MS);
  };

  const knobOffset = isDark ? TRACK_WIDTH : 0;

  return (
    <div className="px-2 py-1">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        className={cn(
          "relative h-8 shrink-0 overflow-visible rounded-full transition-[background-color,box-shadow] ease-in-out",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isDark
            ? "bg-[#2a3042] shadow-[inset_3px_3px_8px_rgba(0,0,0,0.45),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]"
            : "bg-[#e8ecf0] shadow-[inset_3px_3px_8px_rgba(0,0,0,0.1),inset_-3px_-3px_8px_rgba(255,255,255,0.95)]",
        )}
        style={{
          width: TRACK_WIDTH,
          transitionDuration: `${ANIMATION_MS}ms`,
        }}
      >
        <span className="sr-only">{isDark ? "Dark mode" : "Light mode"}</span>

        <span
          className={cn(
            "absolute top-1/2 left-0 z-10 flex items-center justify-center rounded-full ease-in-out",
            "transition-[transform,background-color,box-shadow,color]",
            isDark
              ? "bg-[#4a5568] text-white/80 shadow-[3px_3px_10px_rgba(0,0,0,0.45),-2px_-2px_6px_rgba(255,255,255,0.08)]"
              : "bg-white text-[#b0b8c4] shadow-[4px_4px_12px_rgba(0,0,0,0.14),-2px_-2px_8px_rgba(255,255,255,1)]",
          )}
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            transform: `translate(calc(${knobOffset}px - 50%), -50%)`,
            transitionDuration: `${ANIMATION_MS}ms`,
          }}
        >
          {isDark ? (
            <Moon className="size-3.5" strokeWidth={2.25} />
          ) : (
            <Sun className="size-3.5" strokeWidth={2.25} />
          )}
        </span>
      </button>
    </div>
  );
};
