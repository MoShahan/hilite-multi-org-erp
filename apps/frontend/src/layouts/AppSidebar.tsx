import { Building2, Kanban, LayoutDashboard, Shield, Sparkles, Users, UsersRound } from "lucide-react";
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
  selectHasAnyPermission,
  selectHasModule,
  selectHasPermission,
  selectIsPlatformAdmin,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { formatRoleLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const AppSidebar = () => {
  const isPlatformAdmin = useAppSelector(selectIsPlatformAdmin);
  const canViewRoles = useAppSelector(selectHasPermission("roles:read"));
  const canViewUsers = useAppSelector(selectHasPermission("users:read"));
  const canViewTeams = useAppSelector(selectHasPermission("teams:read"));
  const canViewLeads = useAppSelector(
    selectHasAnyPermission([
      "leads:read",
      "leads:read:team",
      "leads:read:org",
    ]),
  );
  const hasDashboardsModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.DASHBOARDS),
  );
  const hasSalesErpModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.SALES_ERP),
  );
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
              {hasDashboardsModule ? (
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
              ) : null}
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
        {canViewRoles || canViewUsers || canViewTeams || (hasSalesErpModule && canViewLeads) ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase text-sidebar-foreground/50">
              Organization
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hasSalesErpModule && canViewLeads ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/leads")}
                      tooltip="Leads"
                      className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to="/leads">
                        <Kanban />
                        <span>Leads</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
                {canViewUsers ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/users")}
                      tooltip="Users"
                      className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to="/users">
                        <Users />
                        <span>Users</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
                {canViewTeams ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/teams")}
                      tooltip="Teams"
                      className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to="/teams">
                        <UsersRound />
                        <span>Teams</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
                {canViewRoles ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/roles")}
                      tooltip="Roles"
                      className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to="/roles">
                        <Shield />
                        <span>Roles</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
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
