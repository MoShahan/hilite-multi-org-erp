import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useAppSelector } from "@/app/hooks";
import { selectCanAccessNotifications } from "@/features/auth/authSelectors";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/layouts/AppSidebar";

import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const canAccessNotifications = useAppSelector(selectCanAccessNotifications);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="glass-panel sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6">
            <SidebarTrigger className="-ml-1 size-8" />
            <div className="flex flex-1 items-center justify-end gap-3">
              <ThemeToggle />
              {canAccessNotifications ? <NotificationBell /> : null}
            </div>
          </header>
          <main className="flex flex-1 flex-col bg-muted/20 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
