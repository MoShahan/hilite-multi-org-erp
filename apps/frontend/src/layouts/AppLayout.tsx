import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { selectAuthUser } from "@/features/auth/authSelectors";
import { logout } from "@/features/auth/authSlice";

import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-panel sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
          <h1 className="text-lg font-semibold tracking-tight">
            HILITE Sales OS
          </h1>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleLogout()}
            >
              Sign out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6 md:p-8">{children}</main>
    </div>
  );
};
