import { PermissionScope, RoleMembershipScope } from "../generated/prisma/client";
import { isOrgWidePermission } from "../constants/permissionMembership";
import { PROTECTED_ROLE_SLUGS } from "../constants/defaultRoles";
import { permissionRepository } from "../repositories/permission.repository";
import {
  roleRepository,
  type RoleWithPermissions,
} from "../repositories/role.repository";
import {
  parseRoleMembershipScopeQuery,
  toApiRoleMembershipScope,
  toPrismaRoleMembershipScope,
} from "../lib/roleMembershipScope";
import { getRoleAssignmentRules } from "../lib/roleAssignmentRules";
import type { RoleMembershipScopeValue } from "../constants/defaultRoles";
import type {
  CreateRoleInput,
  ListRolesQuery,
  ListRolesResponse,
  RoleDetailResponse,
  RoleResponse,
  UpdateRoleInput,
} from "../types/role";
import { AppError } from "../utils/AppError";

const SLUG_PATTERN = /^[a-z0-9_]+$/;

const normalizeSlug = (slug: string): string => {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

const toRoleResponse = (role: RoleWithPermissions): RoleResponse => {
  const isProtected = PROTECTED_ROLE_SLUGS.has(role.slug);
  const userCount = role._count.userRoles;
  const assignmentRules = getRoleAssignmentRules(role);

  return {
    id: role.id,
    name: role.name,
    slug: role.slug,
    membershipScope: toApiRoleMembershipScope(role.membershipScope),
    requiresTeamMembership: assignmentRules.requiresTeamMembership,
    assignableFrom: assignmentRules.assignableFrom,
    permissions: role.permissions.map((entry) => entry.permissionKey),
    userCount,
    isProtected,
    canDelete: !isProtected && userCount === 0,
  };
};

const requireOrganizationId = (organizationId: string | null | undefined) => {
  if (!organizationId) {
    throw AppError.forbidden("Organization context is required");
  }

  return organizationId;
};

const parseMembershipScope = (
  value: RoleMembershipScopeValue | undefined,
): RoleMembershipScope => {
  if (value !== "team" && value !== "organization") {
    throw AppError.badRequest("membershipScope must be team or organization");
  }

  return toPrismaRoleMembershipScope(value);
};

const validatePermissions = async (
  permissionKeys: string[],
  roleMembershipScope: RoleMembershipScope,
) => {
  const uniqueKeys = [...new Set(permissionKeys)];

  if (uniqueKeys.length !== permissionKeys.length) {
    throw AppError.badRequest("Duplicate permissions are not allowed");
  }

  const permissions = await permissionRepository.findByKeys(uniqueKeys);

  if (permissions.length !== uniqueKeys.length) {
    throw AppError.badRequest("One or more permissions are invalid");
  }

  const invalidScope = permissions.some(
    (permission) => permission.scope !== PermissionScope.ORGANIZATION,
  );

  if (invalidScope) {
    throw AppError.badRequest(
      "Organization roles cannot include platform permissions",
    );
  }

  if (roleMembershipScope === RoleMembershipScope.TEAM) {
    const invalidKeys = uniqueKeys.filter(isOrgWidePermission);

    if (invalidKeys.length > 0) {
      throw AppError.badRequest(
        "Team roles cannot include organization-level permissions",
      );
    }
  }

  return uniqueKeys;
};

export const roleService = {
  listRoles: async (
    organizationId: string | null,
    query: ListRolesQuery = {},
  ): Promise<ListRolesResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const membershipScope = query.membershipScope
      ? toPrismaRoleMembershipScope(query.membershipScope)
      : undefined;

    const roles = await roleRepository.findManyByOrganization(orgId, {
      membershipScope,
    });

    const filteredRoles = query.assignableFrom
      ? roles.filter((role) =>
          getRoleAssignmentRules(role).assignableFrom.includes(
            query.assignableFrom!,
          ),
        )
      : roles;

    return {
      roles: filteredRoles.map(toRoleResponse),
    };
  },

  getRole: async (
    organizationId: string | null,
    roleId: string,
  ): Promise<RoleDetailResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const role = await roleRepository.findByIdForOrganization(roleId, orgId);

    if (!role) {
      throw AppError.notFound("Role not found");
    }

    return { role: toRoleResponse(role) };
  },

  createRole: async (
    organizationId: string | null,
    input: CreateRoleInput,
  ): Promise<RoleDetailResponse> => {
    const orgId = requireOrganizationId(organizationId);

    const name = input.name?.trim();
    if (!name) {
      throw AppError.badRequest("Role name is required");
    }

    const slug = normalizeSlug(input.slug || name);
    if (!slug || !SLUG_PATTERN.test(slug)) {
      throw AppError.badRequest(
        "Role slug must contain only lowercase letters, numbers, and underscores",
      );
    }

    if (PROTECTED_ROLE_SLUGS.has(slug)) {
      throw AppError.badRequest("This role slug is reserved");
    }

    const existing = await roleRepository.findBySlugForOrganization(orgId, slug);
    if (existing) {
      throw AppError.badRequest("A role with this slug already exists");
    }

    const membershipScope = parseMembershipScope(input.membershipScope);
    const permissionKeys = await validatePermissions(
      input.permissions ?? [],
      membershipScope,
    );

    const role = await roleRepository.create({
      organizationId: orgId,
      name,
      slug,
      membershipScope,
      permissionKeys,
    });

    return { role: toRoleResponse(role) };
  },

  updateRole: async (
    organizationId: string | null,
    roleId: string,
    input: UpdateRoleInput,
  ): Promise<RoleDetailResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const role = await roleRepository.findByIdForOrganization(roleId, orgId);

    if (!role) {
      throw AppError.notFound("Role not found");
    }

    const name = input.name !== undefined ? input.name.trim() : undefined;
    if (name !== undefined && !name) {
      throw AppError.badRequest("Role name is required");
    }

    const permissionKeys =
      input.permissions !== undefined
        ? await validatePermissions(input.permissions, role.membershipScope)
        : undefined;

    const updated = await roleRepository.update(roleId, {
      name,
      permissionKeys,
    });

    return { role: toRoleResponse(updated) };
  },

  deleteRole: async (
    organizationId: string | null,
    roleId: string,
  ): Promise<void> => {
    const orgId = requireOrganizationId(organizationId);
    const role = await roleRepository.findByIdForOrganization(roleId, orgId);

    if (!role) {
      throw AppError.notFound("Role not found");
    }

    if (PROTECTED_ROLE_SLUGS.has(role.slug)) {
      throw AppError.badRequest("This role cannot be deleted");
    }

    if (role._count.userRoles > 0) {
      throw AppError.badRequest("Cannot delete a role that is assigned to users");
    }

    await roleRepository.delete(roleId);
  },

  parseListQuery: (rawQuery: Record<string, unknown>): ListRolesQuery => {
    const membershipScope = parseRoleMembershipScopeQuery(
      rawQuery.membershipScope,
    );
    const assignableFromRaw =
      typeof rawQuery.assignableFrom === "string"
        ? rawQuery.assignableFrom
        : undefined;
    const assignableFrom =
      assignableFromRaw === "users" || assignableFromRaw === "team"
        ? assignableFromRaw
        : undefined;

    return {
      ...(membershipScope ? { membershipScope } : {}),
      ...(assignableFrom ? { assignableFrom } : {}),
    };
  },
};
