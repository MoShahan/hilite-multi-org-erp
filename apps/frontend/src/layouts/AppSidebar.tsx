import { Building2, LayoutDashboard, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { EntityAvatar } from "@/components/EntityAvatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  selectAuthUser,
  selectIsPlatformAdmin,
} from "@/features/auth/authSelectors";
import { formatRoleLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const AppSidebar = () => {
  const isPlatformAdmin = useAppSelector(selectIsPlatformAdmin);
  const user = useAppSelector(selectAuthUser);
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm",
            )}
          >
            <Sparkles className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">
              HILITE Sales OS
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              Sales platform
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase text-sidebar-foreground/50">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/dashboard"}
                  tooltip="Dashboard"
                  className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                >
                  <NavLink to="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isPlatformAdmin ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(
                      "/platform/organizations",
                    )}
                    tooltip="Organizations"
                    className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                  >
                    <NavLink to="/platform/organizations">
                      <Building2 />
                      <span>Organizations</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {user ? (
        <>
          <SidebarSeparator className="mx-3" />
          <SidebarFooter className="p-3">
            <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/30 p-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
              <EntityAvatar name={user.name} size="sm" />
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <Badge
                  variant="outline"
                  className="mt-1 h-5 border-sidebar-border/60 px-1.5 text-[10px] font-normal"
                >
                  {formatRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </SidebarFooter>
        </>
      ) : null}
    </Sidebar>
  );
};
