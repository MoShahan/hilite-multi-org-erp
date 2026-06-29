import { PermissionScope, RoleMembershipScope } from "../generated/prisma/client";
import { isOrgWidePermission } from "../constants/permissionMembership";
import { PROTECTED_ROLE_SLUGS } from "../constants/defaultRoles";
import { buildActorSnapshot, buildChangeSet } from "../lib/auditHelpers";
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
import {
  authorizeRoleDetailAccess,
  authorizeRoleListAccess,
} from "../lib/roleAccess";
import { auditService } from "./audit.service";
import type { AuditMutationContext } from "../types/audit";
import type { AuthUser } from "../types/auth";
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
  const userCount = role._count.members;
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
    authUser: AuthUser,
  ): Promise<ListRolesResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const scopedQuery = authorizeRoleListAccess(authUser, query);
    const membershipScope = scopedQuery.membershipScope
      ? toPrismaRoleMembershipScope(scopedQuery.membershipScope)
      : undefined;

    const roles = await roleRepository.findManyByOrganization(orgId, {
      membershipScope,
    });

    const filteredRoles = scopedQuery.assignableFrom
      ? roles.filter((role) =>
          getRoleAssignmentRules(role).assignableFrom.includes(
            scopedQuery.assignableFrom!,
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
    authUser: AuthUser,
  ): Promise<RoleDetailResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const role = await roleRepository.findByIdForOrganization(roleId, orgId);

    if (!role) {
      throw AppError.notFound("Role not found");
    }

    authorizeRoleDetailAccess(authUser, role);

    return { role: toRoleResponse(role) };
  },

  createRole: async (
    organizationId: string | null,
    input: CreateRoleInput,
    auditContext?: AuditMutationContext,
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

    if (auditContext) {
      auditService.log({
        organizationId: orgId,
        actorId: auditContext.authUser.id,
        action: "ROLE_CREATED",
        entityType: "role",
        entityId: role.id,
        metadata: {
          summary: `Role created: ${role.name}`,
          actor: buildActorSnapshot(auditContext.authUser),
          after: {
            name: role.name,
            slug: role.slug,
            membershipScope: toApiRoleMembershipScope(role.membershipScope),
            permissions: permissionKeys,
          },
        },
        requestContext: auditContext.requestContext,
      });
    }

    return { role: toRoleResponse(role) };
  },

  updateRole: async (
    organizationId: string | null,
    roleId: string,
    input: UpdateRoleInput,
    auditContext?: AuditMutationContext,
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

    if (auditContext) {
      const beforePermissions = role.permissions.map((p) => p.permissionKey);
      const afterPermissions = updated.permissions.map((p) => p.permissionKey);
      const permissionsAdded = afterPermissions.filter(
        (key) => !beforePermissions.includes(key),
      );
      const permissionsRemoved = beforePermissions.filter(
        (key) => !afterPermissions.includes(key),
      );
      const nameChanges = buildChangeSet(
        { name: role.name },
        { name: updated.name },
        ["name"],
      );

      auditService.log({
        organizationId: orgId,
        actorId: auditContext.authUser.id,
        action: "ROLE_UPDATED",
        entityType: "role",
        entityId: roleId,
        metadata: {
          summary: `Role updated: ${updated.name}`,
          actor: buildActorSnapshot(auditContext.authUser),
          before: {
            ...nameChanges.before,
            permissions: beforePermissions,
          },
          after: {
            ...nameChanges.after,
            permissions: afterPermissions,
          },
          changedFields: [
            ...nameChanges.changedFields,
            ...(permissionsAdded.length || permissionsRemoved.length
              ? ["permissions"]
              : []),
          ],
          permissionsAdded,
          permissionsRemoved,
          related: {
            role: { id: updated.id, name: updated.name, slug: updated.slug },
          },
        },
        requestContext: auditContext.requestContext,
      });
    }

    return { role: toRoleResponse(updated) };
  },

  deleteRole: async (
    organizationId: string | null,
    roleId: string,
    auditContext?: AuditMutationContext,
  ): Promise<void> => {
    const orgId = requireOrganizationId(organizationId);
    const role = await roleRepository.findByIdForOrganization(roleId, orgId);

    if (!role) {
      throw AppError.notFound("Role not found");
    }

    if (PROTECTED_ROLE_SLUGS.has(role.slug)) {
      throw AppError.badRequest("This role cannot be deleted");
    }

    if (role._count.members > 0) {
      throw AppError.badRequest("Cannot delete a role that is assigned to users");
    }

    if (auditContext) {
      auditService.log({
        organizationId: orgId,
        actorId: auditContext.authUser.id,
        action: "ROLE_DELETED",
        entityType: "role",
        entityId: roleId,
        metadata: {
          summary: `Role deleted: ${role.name}`,
          actor: buildActorSnapshot(auditContext.authUser),
          before: {
            name: role.name,
            slug: role.slug,
            membershipScope: toApiRoleMembershipScope(role.membershipScope),
            permissions: role.permissions.map((p) => p.permissionKey),
          },
          related: {
            role: { id: role.id, name: role.name, slug: role.slug },
          },
        },
        requestContext: auditContext.requestContext,
      });
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
