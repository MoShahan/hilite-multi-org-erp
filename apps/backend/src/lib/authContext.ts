import type { AuthContext, AuthMembership, AuthRole, AuthTeam } from "../types/auth";

export const getActiveOrgId = (context: AuthContext): string | null =>
  context.organization?.id ?? null;

export const getMembershipPermissions = (context: AuthContext): string[] =>
  context.membership?.permissions ?? [];

export const getCallerTeamId = (context: AuthContext): string | null =>
  context.membership?.team?.id ?? null;

export const isPlatformAdmin = (context: AuthContext): boolean =>
  context.organization === null;

export const flattenAuthUser = (context: AuthContext) => ({
  ...context.user,
  role: context.membership?.role ?? null,
  permissions: context.membership?.permissions ?? [],
  team: context.membership?.team ?? null,
});

export const hasPermission = (
  context: AuthContext,
  permission: string,
): boolean => getMembershipPermissions(context).includes(permission);

export const toAuthRole = (role: {
  id: string;
  name: string;
  slug: string;
}): AuthRole => ({
  id: role.id,
  name: role.name,
  slug: role.slug,
});

export const toAuthTeam = (team: {
  id: string;
  name: string;
}): AuthTeam => ({
  id: team.id,
  name: team.name,
});

export const toAuthMembership = (membership: {
  role: {
    id: string;
    name: string;
    slug: string;
    permissions: { permissionKey: string }[];
  };
  teamMember: {
    team: { id: string; name: string };
  } | null;
}): AuthMembership => ({
  role: toAuthRole(membership.role),
  permissions: membership.role.permissions.map(
    (entry) => entry.permissionKey,
  ),
  team: membership.teamMember ? toAuthTeam(membership.teamMember.team) : null,
});
