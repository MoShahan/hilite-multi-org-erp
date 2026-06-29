import {
  Building2,
  History,
  Kanban,
  LayoutDashboard,
  ScrollText,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { HiliteLogo } from "@/components/HiliteLogo";
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
import { UserMenu } from "@/components/UserMenu";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { LEADS_READ_PERMISSIONS, PERMISSIONS } from "@/constants/permissions";
import {
  selectAuthUser,
  selectHasAnyPermission,
  selectHasModule,
  selectHasPermission,
  selectIsPlatformAdmin,
} from "@/features/auth/authSelectors";
import { selectCanViewDashboard } from "@/lib/defaultLandingPath";

export const AppSidebar = () => {
  const isPlatformAdmin = useAppSelector(selectIsPlatformAdmin);
  const canViewAudit = useAppSelector(
    selectHasPermission(PERMISSIONS.AUDIT_READ),
  );
  const canViewPlatformAudit = useAppSelector(
    selectHasPermission(PERMISSIONS.PLATFORM_AUDIT_READ),
  );
  const canViewPlatformAdmins = useAppSelector(
    selectHasPermission(PERMISSIONS.PLATFORM_USERS_READ),
  );
  const canViewRoles = useAppSelector(
    selectHasAnyPermission([PERMISSIONS.ROLES_WRITE]),
  );
  const canViewUsers = useAppSelector(
    selectHasPermission(PERMISSIONS.USERS_READ),
  );
  const canViewTeams = useAppSelector(
    selectHasPermission(PERMISSIONS.TEAMS_READ),
  );
  const canViewMyTeam =
    useAppSelector(selectHasPermission(PERMISSIONS.USERS_READ_TEAM)) &&
    !canViewTeams;
  const canViewLeads = useAppSelector(
    selectHasAnyPermission([...LEADS_READ_PERMISSIONS]),
  );
  const canViewDashboard = useAppSelector(selectCanViewDashboard);
  const hasSalesErpModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.SALES_ERP),
  );
  const user = useAppSelector(selectAuthUser);
  const location = useLocation();
  const hasPlatformSection =
    canViewPlatformAudit || canViewPlatformAdmins || isPlatformAdmin;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <HiliteLogo className="size-9 rounded-xl" />
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
      <SidebarSeparator className="mx-0 w-full" />
      <SidebarContent className="px-2 py-3">
        {hasPlatformSection ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase text-sidebar-foreground/50">
              Platform
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
                {canViewPlatformAdmins ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/platform/admins")}
                      tooltip="Platform admins"
                      className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to="/platform/admins">
                        <Shield />
                        <span>Platform admins</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
                {canViewPlatformAudit ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/platform/audit")}
                      tooltip="Platform audit"
                      className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to="/platform/audit">
                        <History />
                        <span>Platform audit</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {canViewDashboard ||
        canViewRoles ||
        canViewUsers ||
        canViewTeams ||
        canViewMyTeam ||
        canViewAudit ||
        (hasSalesErpModule && canViewLeads) ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase text-sidebar-foreground/50">
              Organization
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {canViewDashboard ? (
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
                {canViewMyTeam ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/my-team")}
                      tooltip="My team"
                      className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to="/my-team">
                        <UsersRound />
                        <span>My team</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
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
                {canViewAudit ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/audit")}
                      tooltip="Audit trail"
                      className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to="/audit">
                        <ScrollText />
                        <span>Audit trail</span>
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
          <SidebarSeparator className="mx-0 w-full" />
          <SidebarFooter className="p-3">
            <UserMenu />
          </SidebarFooter>
        </>
      ) : null}
    </Sidebar>
  );
};
