import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const supportsMaskedText =
  typeof CSS !== "undefined" &&
  CSS.supports("-webkit-text-security", "disc");

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  resetToken?: unknown;
};

const PasswordInput = ({
  className,
  resetToken,
  ...props
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
  }, [resetToken]);

  const useTextMask = supportsMaskedText && !visible;

  return (
    <div className="relative">
      <Input
        type={visible || useTextMask ? "text" : "password"}
        data-slot="password-input"
        className={cn(
          "password-input pr-10",
          useTextMask && "password-input-masked",
          className,
        )}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-1 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
};

export { PasswordInput };
