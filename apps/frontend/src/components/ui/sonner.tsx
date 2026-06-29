import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { cn } from "@/lib/utils";

import type { CSSProperties } from "react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand
      richColors
      closeButton
      gap={12}
      offset={20}
      duration={4500}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast relative overflow-visible rounded-xl border pr-10 shadow-lg backdrop-blur-md",
            "bg-background/95 text-foreground border-border/60",
            "data-[type=success]:border-emerald-500/20 data-[type=success]:bg-emerald-50/90",
            "dark:data-[type=success]:bg-emerald-950/40 dark:data-[type=success]:border-emerald-500/25",
            "data-[type=error]:border-destructive/25 data-[type=error]:bg-destructive/5",
          ),
          title: "text-sm font-semibold tracking-tight",
          description: "text-sm text-muted-foreground",
          actionButton:
            "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground",
          cancelButton:
            "rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground",
          closeButton: cn(
            "!left-auto !right-2 !top-2 !translate-none",
            "flex size-7 items-center justify-center rounded-full",
            "border border-border/70 bg-background text-foreground shadow-sm",
            "opacity-100 transition-colors hover:bg-muted hover:text-foreground",
            "dark:border-white/15 dark:bg-zinc-900 dark:hover:bg-zinc-800",
          ),
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-xl)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
