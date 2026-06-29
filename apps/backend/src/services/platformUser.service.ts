import bcrypt from "bcrypt";

import { PERMISSIONS } from "../constants/permissions";
import { UserStatus } from "../generated/prisma/client";
import { buildActorSnapshot } from "../lib/auditHelpers";
import { assertPasswordStrength } from "../lib/password";
import {
  platformUserRepository,
  type PlatformUserRecord,
} from "../repositories/platformUser.repository";
import { authUserRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";

import { auditService } from "./audit.service";
import { welcomeNotificationService } from "./welcomeNotification.service";

import type { AuditMutationContext } from "../types/audit";
import type { AuthUser } from "../types/auth";
import type {
  CreatePlatformUserInput,
  ListPlatformUsersQuery,
  PaginatedPlatformUsersResponse,
  ParsedListPlatformUsersQuery,
  PlatformUserListSortBy,
  PlatformUserListSortOrder,
  PlatformUserListStatusFilter,
  PlatformUserResponse,
  UpdatePlatformUserStatusInput,
} from "../types/platformUser";


const SALT_ROUNDS = 10;

const DEFAULT_LIST_QUERY = {
  status: "ALL" as PlatformUserListStatusFilter,
  sortBy: "createdAt" as PlatformUserListSortBy,
  sortOrder: "desc" as PlatformUserListSortOrder,
  page: 1,
  pageSize: 10,
};

const SORT_BY_VALUES: PlatformUserListSortBy[] = [
  "name",
  "email",
  "status",
  "createdAt",
];

const SORT_ORDER_VALUES: PlatformUserListSortOrder[] = ["asc", "desc"];

const STATUS_FILTER_VALUES: PlatformUserListStatusFilter[] = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
];

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

const parseListQuery = (
  rawQuery: Record<string, unknown>,
): ParsedListPlatformUsersQuery => {
  const statusRaw = parseQueryValue(rawQuery.status)?.toUpperCase();
  const status = STATUS_FILTER_VALUES.includes(
    statusRaw as PlatformUserListStatusFilter,
  )
    ? (statusRaw as PlatformUserListStatusFilter)
    : DEFAULT_LIST_QUERY.status;

  const sortByRaw = parseQueryValue(rawQuery.sortBy);
  const sortBy = SORT_BY_VALUES.includes(sortByRaw as PlatformUserListSortBy)
    ? (sortByRaw as PlatformUserListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrderRaw = parseQueryValue(rawQuery.sortOrder)?.toLowerCase();
  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as PlatformUserListSortOrder,
  )
    ? (sortOrderRaw as PlatformUserListSortOrder)
    : DEFAULT_LIST_QUERY.sortOrder;

  const search = parseQueryValue(rawQuery.search)?.trim();

  return {
    search: search || undefined,
    status,
    sortBy,
    sortOrder,
    page: parsePositiveInt(rawQuery.page, DEFAULT_LIST_QUERY.page),
    pageSize: Math.min(
      100,
      parsePositiveInt(rawQuery.pageSize, DEFAULT_LIST_QUERY.pageSize),
    ),
  };
};

const toPlatformUserResponse = (user: PlatformUserRecord): PlatformUserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  status: user.status,
  createdAt: user.createdAt.toISOString(),
});

const authorizeList = (authUser: AuthUser) => {
  if (!hasPermission(authUser, PERMISSIONS.PLATFORM_USERS_READ)) {
    throw AppError.forbidden(
      "You do not have permission to view platform admins",
    );
  }
};

const authorizeWrite = (authUser: AuthUser) => {
  if (!hasPermission(authUser, PERMISSIONS.PLATFORM_USERS_WRITE)) {
    throw AppError.forbidden(
      "You do not have permission to manage platform admins",
    );
  }
};

export const platformUserService = {
  listPlatformUsers: async (
    authUser: AuthUser,
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedPlatformUsersResponse> => {
    authorizeList(authUser);

    const query = parseListQuery(rawQuery);
    const { users, total } = await platformUserRepository.findManyPaginated(
      query,
    );

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      users: users.map(toPlatformUserResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  createPlatformUser: async (
    authUser: AuthUser,
    input: CreatePlatformUserInput,
    auditContext?: AuditMutationContext,
  ): Promise<PlatformUserResponse> => {
    authorizeWrite(authUser);

    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

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

    const existingEmail = await authUserRepository.emailExists(email);
    if (existingEmail) {
      throw AppError.badRequest("Email is already in use", [
        { field: "email", message: "Email is already in use" },
      ]);
    }

    const role = await platformUserRepository.findPlatformRole();
    if (!role) {
      throw new AppError(
        500,
        "PLATFORM_ROLE_MISSING",
        "Platform admin role is not configured",
      );
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await platformUserRepository.createPlatformAdmin({
      name,
      email,
      passwordHash,
      roleId: role.id,
    });

    if (auditContext) {
      auditService.log({
        organizationId: null,
        actorId: auditContext.authUser.id,
        action: "PLATFORM_USER_CREATED",
        entityType: "user",
        entityId: user.id,
        metadata: {
          summary: `Platform admin created: ${user.name}`,
          actor: buildActorSnapshot(auditContext.authUser),
          after: { name: user.name, email: user.email, status: user.status },
          related: {
            targetUser: { id: user.id, name: user.name, email: user.email },
          },
        },
        requestContext: auditContext.requestContext,
      });
    }

    await welcomeNotificationService.notifyNewUser(user.id, null, user.name);

    return toPlatformUserResponse(user);
  },

  updatePlatformUserStatus: async (
    authUser: AuthUser,
    targetUserId: string,
    input: UpdatePlatformUserStatusInput,
    auditContext?: AuditMutationContext,
  ): Promise<PlatformUserResponse> => {
    authorizeWrite(authUser);

    if (
      input.status !== UserStatus.ACTIVE &&
      input.status !== UserStatus.INACTIVE
    ) {
      throw AppError.badRequest("Invalid user status");
    }

    const existing = await platformUserRepository.findById(targetUserId);

    if (!existing) {
      throw AppError.notFound("Platform admin not found");
    }

    if (existing.status === input.status) {
      return toPlatformUserResponse(existing);
    }

    if (
      input.status === UserStatus.INACTIVE &&
      targetUserId === authUser.id
    ) {
      throw AppError.badRequest("You cannot deactivate your own account");
    }

    if (input.status === UserStatus.INACTIVE) {
      const activeCount = await platformUserRepository.countActivePlatformAdmins();

      if (activeCount <= 1) {
        throw AppError.badRequest(
          "Cannot deactivate the last active platform admin",
        );
      }
    }

    const user = await platformUserRepository.updateStatus(
      targetUserId,
      input.status,
    );

    if (auditContext) {
      const action =
        input.status === UserStatus.ACTIVE
          ? "USER_ACTIVATED"
          : "USER_DEACTIVATED";

      auditService.log({
        organizationId: null,
        actorId: auditContext.authUser.id,
        action,
        entityType: "user",
        entityId: user.id,
        metadata: {
          summary: `${action === "USER_ACTIVATED" ? "Platform admin activated" : "Platform admin deactivated"}: ${user.name}`,
          actor: buildActorSnapshot(auditContext.authUser),
          before: { status: existing.status },
          after: { status: user.status },
          related: {
            targetUser: { id: user.id, name: user.name, email: user.email },
          },
        },
        requestContext: auditContext.requestContext,
      });
    }

    return toPlatformUserResponse(user);
  },
};

export type { ListPlatformUsersQuery };
