import bcrypt from "bcrypt";

import { PERMISSIONS } from "../constants/permissions";
import { UserStatus } from "../generated/prisma/client";
import { buildActorSnapshot } from "../lib/auditHelpers";
import { assertPasswordStrength } from "../lib/password";
import {
  assertRoleAssignableFrom,
  getRoleAssignmentRules,
} from "../lib/roleAssignmentRules";
import { parseRoleMembershipScopeQuery } from "../lib/roleMembershipScope";
import {
  authUserRepository,
  orgUserRepository,
  type OrgMemberListRecord,
} from "../repositories/user.repository";
import { AppError } from "../utils/AppError";

import { auditService } from "./audit.service";
import { getCallerTeamId } from "./leadAccess.service";
import { welcomeNotificationService } from "./welcomeNotification.service";

import type { RoleMembershipScopeValue } from "../constants/defaultRoles";
import type { AuditMutationContext } from "../types/audit";
import type { AuthUser } from "../types/auth";
import type {
  CreateUserInput,
  ListUserOptionsQuery,
  ListUsersQuery,
  PaginatedUsersResponse,
  ParsedListUsersQuery,
  ParsedUserOptionsQuery,
  UserListFor,
  UserListSortBy,
  UserListSortOrder,
  UserListStatusFilter,
  UserOption,
  UserResponse,
  UserOptionsResponse,
  UpdateUserStatusInput,
} from "../types/user";

const SALT_ROUNDS = 10;

const DEFAULT_LIST_QUERY = {
  status: "ALL" as UserListStatusFilter,
  sortBy: "createdAt" as UserListSortBy,
  sortOrder: "desc" as UserListSortOrder,
  page: 1,
  pageSize: 10,
};

const SORT_BY_VALUES: UserListSortBy[] = [
  "name",
  "email",
  "status",
  "role",
  "team",
  "createdAt",
];

const SORT_ORDER_VALUES: UserListSortOrder[] = ["asc", "desc"];

const STATUS_FILTER_VALUES: UserListStatusFilter[] = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
];

const USER_LIST_FOR_VALUES: UserListFor[] = ["lead-assignment", "filter"];

const OPTIONS_LIMIT = 100;

const hasPermission = (user: AuthUser, permission: string) =>
  user.permissions.includes(permission);

const parseQueryValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(parseQueryValue(value) ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const parseListQuery = (rawQuery: Record<string, unknown>): ParsedListUsersQuery => {
  const search = parseQueryValue(rawQuery.search)?.trim();
  const statusRaw = parseQueryValue(rawQuery.status)?.toUpperCase();
  const sortByRaw = parseQueryValue(rawQuery.sortBy);
  const sortOrderRaw = parseQueryValue(rawQuery.sortOrder)?.toLowerCase();
  const membershipScopeRaw = parseQueryValue(rawQuery.membershipScope);
  const teamIdRaw = parseQueryValue(rawQuery.teamId);
  const roleId = parseQueryValue(rawQuery.roleId);

  const status = STATUS_FILTER_VALUES.includes(
    statusRaw as UserListStatusFilter,
  )
    ? (statusRaw as UserListStatusFilter)
    : DEFAULT_LIST_QUERY.status;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as UserListSortBy)
    ? (sortByRaw as UserListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as UserListSortOrder,
  )
    ? (sortOrderRaw as UserListSortOrder)
    : DEFAULT_LIST_QUERY.sortOrder;

  const membershipScope: RoleMembershipScopeValue | undefined =
    parseRoleMembershipScopeQuery(membershipScopeRaw);

  const page = parsePositiveInt(rawQuery.page, DEFAULT_LIST_QUERY.page);
  const pageSize = Math.min(
    100,
    parsePositiveInt(rawQuery.pageSize, DEFAULT_LIST_QUERY.pageSize),
  );

  const teamIdIsNone = teamIdRaw === "none";
  const teamId =
    teamIdRaw && teamIdRaw !== "none" ? teamIdRaw : undefined;

  return {
    search: search || undefined,
    status,
    roleId: roleId || undefined,
    membershipScope,
    teamId,
    teamIdIsNone,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

const toUserResponse = (member: OrgMemberListRecord): UserResponse => ({
  id: member.user.id,
  name: member.user.name,
  email: member.user.email,
  status: member.status,
  role: {
    id: member.role.id,
    name: member.role.name,
    slug: member.role.slug,
  },
  team: member.teamMember?.team
    ? { id: member.teamMember.team.id, name: member.teamMember.team.name }
    : null,
  createdAt: member.user.createdAt.toISOString(),
});

const requireOrganizationId = (organizationId: string | null | undefined) => {
  if (!organizationId) {
    throw AppError.forbidden("Organization context is required");
  }

  return organizationId;
};

const authorizeListUsers = (authUser: AuthUser, query: ParsedListUsersQuery) => {
  const canReadOrg = hasPermission(authUser, PERMISSIONS.USERS_READ);
  const canReadTeam = hasPermission(authUser, PERMISSIONS.USERS_READ_TEAM);

  if (!canReadOrg && !canReadTeam) {
    throw AppError.forbidden("You do not have permission to view users");
  }

  if (!canReadOrg && canReadTeam) {
    const callerTeamId = getCallerTeamId(authUser);
    if (!callerTeamId) {
      throw AppError.forbidden("Team context is required to view team users");
    }

    query.teamId = callerTeamId;
    query.teamIdIsNone = false;
  }
};

const parseUserOptionsQuery = (
  rawQuery: Record<string, unknown>,
): ParsedUserOptionsQuery => {
  const forRaw = parseQueryValue(rawQuery.for);
  const forParam = USER_LIST_FOR_VALUES.includes(forRaw as UserListFor)
    ? (forRaw as UserListFor)
    : "filter";

  const teamIdRaw = parseQueryValue(rawQuery.teamId);
  const teamIdIsNone = teamIdRaw === "none";
  const teamId =
    teamIdRaw && teamIdRaw !== "none" ? teamIdRaw : undefined;
  const search = parseQueryValue(rawQuery.search)?.trim();

  return {
    for: forParam,
    teamId,
    teamIdIsNone,
    search: search || undefined,
    status: UserStatus.ACTIVE,
  };
};

const authorizeUserOptions = (
  authUser: AuthUser,
  query: ParsedUserOptionsQuery,
) => {
  if (query.for === "lead-assignment") {
    if (!hasPermission(authUser, PERMISSIONS.LEADS_WRITE)) {
      throw AppError.forbidden("You do not have permission to list assignable users");
    }

    if (!query.teamId) {
      throw AppError.badRequest("teamId is required", [
        { field: "teamId", message: "teamId is required" },
      ]);
    }

    if (
      hasPermission(authUser, PERMISSIONS.LEADS_READ_TEAM) &&
      !hasPermission(authUser, PERMISSIONS.LEADS_READ_ORG)
    ) {
      const callerTeamId = getCallerTeamId(authUser);
      if (!callerTeamId || query.teamId !== callerTeamId) {
        throw AppError.forbidden("You can only list assignable users on your team");
      }
    }

    return;
  }

  const canReadOrg = hasPermission(authUser, PERMISSIONS.USERS_READ);
  const canReadTeam = hasPermission(authUser, PERMISSIONS.USERS_READ_TEAM);

  if (!canReadOrg && !canReadTeam) {
    throw AppError.forbidden("You do not have permission to view users");
  }

  if (!canReadOrg && canReadTeam) {
    const callerTeamId = getCallerTeamId(authUser);
    if (!callerTeamId) {
      throw AppError.forbidden("Team context is required to view team users");
    }

    query.teamId = callerTeamId;
    query.teamIdIsNone = false;
  }
};

const toUserOption = (member: {
  user: { id: string; name: string; email: string };
}): UserOption => ({
  id: member.user.id,
  name: member.user.name,
  email: member.user.email,
});

export const orgUserService = {
  listUsers: async (
    organizationId: string | null,
    authUser: AuthUser,
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedUsersResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const query = parseListQuery(rawQuery);
    authorizeListUsers(authUser, query);
    const { members, total } = await orgUserRepository.findManyPaginated(
      orgId,
      query,
    );

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      users: members.map(toUserResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  listUserOptions: async (
    organizationId: string | null,
    authUser: AuthUser,
    rawQuery: Record<string, unknown>,
  ): Promise<UserOptionsResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const query = parseUserOptionsQuery(rawQuery);
    authorizeUserOptions(authUser, query);

    const members = await orgUserRepository.findManyOptions(
      orgId,
      query,
      OPTIONS_LIMIT,
    );

    return {
      users: members.map(toUserOption),
    };
  },

  createUser: async (
    organizationId: string | null,
    input: CreateUserInput,
    auditContext?: AuditMutationContext,
  ): Promise<UserResponse> => {
    const orgId = requireOrganizationId(organizationId);

    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;
    const roleId = input.roleId;

    if (!name) {
      throw AppError.badRequest("Name is required", [
        { field: "name", message: "Name is required" },
      ]);
    }

    if (!email) {
      throw AppError.badRequest("Email is required", [
        { field: "email", message: "Email is required" },
      ]);
    }

    assertPasswordStrength(password ?? "", "password");

    if (!roleId) {
      throw AppError.badRequest("Role is required", [
        { field: "roleId", message: "Role is required" },
      ]);
    }

    const existingMembership = await orgUserRepository.findMembershipByEmail(
      email,
      orgId,
    );
    if (existingMembership) {
      throw AppError.badRequest("User is already a member of this organization", [
        { field: "email", message: "This user already belongs to this organization" },
      ]);
    }

    const existingEmail = await authUserRepository.emailExists(email);
    if (existingEmail) {
      throw AppError.badRequest("Email is already in use", [
        { field: "email", message: "Email is already in use" },
      ]);
    }

    const role = await orgUserRepository.findRoleForOrganization(roleId, orgId);
    if (!role) {
      throw AppError.badRequest("Role is invalid", [
        { field: "roleId", message: "Role is invalid" },
      ]);
    }

    const rules = getRoleAssignmentRules(role);

    try {
      assertRoleAssignableFrom(rules, "users");
    } catch {
      throw AppError.badRequest(
        "This role cannot be assigned from the users page",
        [
          {
            field: "roleId",
            message: "Select an organization-wide role",
          },
        ],
      );
    }

    if (rules.requiresTeamMembership) {
      throw AppError.badRequest(
        "Team-scoped users must be created from a team page",
        [
          {
            field: "roleId",
            message: "Create this role from the team detail page",
          },
        ],
      );
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await orgUserRepository.createWithRole({
      organizationId: orgId,
      name,
      email,
      passwordHash,
      roleId,
    });

    if (auditContext) {
      auditService.log({
        organizationId: orgId,
        actorId: auditContext.authUser.id,
        action: "USER_CREATED",
        entityType: "user",
        entityId: user.user.id,
        metadata: {
          summary: `User created: ${user.user.name}`,
          actor: buildActorSnapshot(auditContext.authUser),
          after: {
            name: user.user.name,
            email: user.user.email,
            status: user.status,
          },
          related: {
            targetUser: {
              id: user.user.id,
              name: user.user.name,
              email: user.user.email,
            },
            role: {
              id: user.role.id,
              name: user.role.name,
              slug: user.role.slug,
            },
          },
        },
        requestContext: auditContext.requestContext,
      });
    }

    await welcomeNotificationService.notifyNewUser(user.user.id, orgId, user.user.name);

    return toUserResponse(user);
  },

  updateUserStatus: async (
    organizationId: string | null,
    actorUserId: string,
    targetUserId: string,
    input: UpdateUserStatusInput,
    auditContext?: AuditMutationContext,
  ): Promise<UserResponse> => {
    const orgId = requireOrganizationId(organizationId);

    if (
      input.status !== UserStatus.ACTIVE &&
      input.status !== UserStatus.INACTIVE
    ) {
      throw AppError.badRequest("Invalid user status");
    }

    const existing = await orgUserRepository.findByIdForOrganization(
      targetUserId,
      orgId,
    );

    if (!existing) {
      throw AppError.notFound("User not found");
    }

    if (existing.status === input.status) {
      return toUserResponse(existing);
    }

    if (
      input.status === UserStatus.INACTIVE &&
      targetUserId === actorUserId
    ) {
      throw AppError.badRequest("You cannot deactivate your own account");
    }

    if (
      input.status === UserStatus.INACTIVE &&
      existing.role.slug === "org_admin"
    ) {
      const activeOrgAdminCount = await orgUserRepository.countActiveByRoleSlug(
        orgId,
        "org_admin",
      );

      if (activeOrgAdminCount <= 1) {
        throw AppError.badRequest("Cannot deactivate the last active org admin");
      }
    }

    const user = await orgUserRepository.updateStatus(
      targetUserId,
      orgId,
      input.status,
    );

    if (auditContext) {
      const action =
        input.status === UserStatus.ACTIVE
          ? "USER_ACTIVATED"
          : "USER_DEACTIVATED";

      auditService.log({
        organizationId: orgId,
        actorId: auditContext.authUser.id,
        action,
        entityType: "user",
        entityId: user.user.id,
        metadata: {
          summary: `${action === "USER_ACTIVATED" ? "User activated" : "User deactivated"}: ${user.user.name}`,
          actor: buildActorSnapshot(auditContext.authUser),
          before: { status: existing.status },
          after: { status: input.status },
          changedFields: ["status"],
          related: {
            targetUser: {
              id: user.user.id,
              name: user.user.name,
              email: user.user.email,
            },
          },
        },
        requestContext: auditContext.requestContext,
      });
    }

    return toUserResponse(user);
  },
};

export type { ListUsersQuery, ListUserOptionsQuery };
