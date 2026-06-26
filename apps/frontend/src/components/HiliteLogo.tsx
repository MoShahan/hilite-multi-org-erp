import { cn } from "@/lib/utils";

type HiliteLogoProps = {
  className?: string;
  iconClassName?: string;
};

const HiliteMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("size-[58%]", className)}
    aria-hidden
  >
    <rect
      x="5"
      y="3.5"
      width="14"
      height="2.5"
      rx="1.25"
      fill="currentColor"
      fillOpacity="0.85"
    />
    <path
      d="M7 8.5V20h2.75v-4.25h4.5V20H17V8.5h-2.75v3.75h-4.5V8.5H7z"
      fill="currentColor"
    />
  </svg>
);

export const HiliteLogo = ({ className, iconClassName }: HiliteLogoProps) => (
  <div
    className={cn(
      "flex size-10 shrink-0 items-center justify-center rounded-lg",
      "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm",
      className,
    )}
  >
    <HiliteMark className={iconClassName} />
  </div>
);
