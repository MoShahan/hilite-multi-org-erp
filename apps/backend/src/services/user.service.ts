import bcrypt from "bcrypt";
import { UserStatus } from "../generated/prisma/client";
import type { RoleMembershipScopeValue } from "../constants/defaultRoles";
import { PERMISSIONS } from "../constants/permissions";
import { parseRoleMembershipScopeQuery } from "../lib/roleMembershipScope";
import {
  assertRoleAssignableFrom,
  getRoleAssignmentRules,
} from "../lib/roleAssignmentRules";
import {
  authUserRepository,
  orgUserRepository,
  type UserListRecord,
} from "../repositories/user.repository";
import { getCallerTeamId } from "./leadAccess.service";
import type { AuthUser } from "../types/auth";
import type {
  CreateUserInput,
  ListUsersQuery,
  PaginatedUsersResponse,
  ParsedListUsersQuery,
  UserListFor,
  UserListSortBy,
  UserListSortOrder,
  UserListStatusFilter,
  UserResponse,
  UpdateUserStatusInput,
} from "../types/user";
import { AppError } from "../utils/AppError";

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

const USER_LIST_FOR_VALUES: UserListFor[] = ["lead-assignment"];

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
  const forRaw = parseQueryValue(rawQuery.for);

  const forParam = USER_LIST_FOR_VALUES.includes(forRaw as UserListFor)
    ? (forRaw as UserListFor)
    : undefined;

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
    for: forParam,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

const toUserResponse = (user: UserListRecord): UserResponse => {
  const teamMember = user.teamMembers[0];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    role: user.userRole?.role
      ? {
          id: user.userRole.role.id,
          name: user.userRole.role.name,
          slug: user.userRole.role.slug,
        }
      : null,
    team: teamMember?.team
      ? { id: teamMember.team.id, name: teamMember.team.name }
      : null,
    createdAt: user.createdAt.toISOString(),
  };
};

const requireOrganizationId = (organizationId: string | null | undefined) => {
  if (!organizationId) {
    throw AppError.forbidden("Organization context is required");
  }

  return organizationId;
};

const authorizeListUsers = (authUser: AuthUser, query: ParsedListUsersQuery) => {
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

    if (query.status === "ALL" || query.status === "INACTIVE") {
      query.status = UserStatus.ACTIVE;
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

export const orgUserService = {
  listUsers: async (
    organizationId: string | null,
    authUser: AuthUser,
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedUsersResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const query = parseListQuery(rawQuery);
    authorizeListUsers(authUser, query);
    const { users, total } = await orgUserRepository.findManyPaginated(
      orgId,
      query,
    );

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      users: users.map(toUserResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  createUser: async (
    organizationId: string | null,
    input: CreateUserInput,
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

    if (!password || password.length < 8) {
      throw AppError.badRequest("Password must be at least 8 characters", [
        {
          field: "password",
          message: "Password must be at least 8 characters",
        },
      ]);
    }

    if (!roleId) {
      throw AppError.badRequest("Role is required", [
        { field: "roleId", message: "Role is required" },
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

    return toUserResponse(user);
  },

  updateUserStatus: async (
    organizationId: string | null,
    actorUserId: string,
    targetUserId: string,
    input: UpdateUserStatusInput,
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
      existing.userRole?.role.slug === "org_admin"
    ) {
      const activeOrgAdminCount = await orgUserRepository.countActiveByRoleSlug(
        orgId,
        "org_admin",
      );

      if (activeOrgAdminCount <= 1) {
        throw AppError.badRequest("Cannot deactivate the last active org admin");
      }
    }

    const user = await orgUserRepository.updateStatus(targetUserId, input.status);
    return toUserResponse(user);
  },
};

export type { ListUsersQuery };
