import bcrypt from "bcrypt";
import {
  assertRoleAssignableFrom,
  getRoleAssignmentRules,
} from "../lib/roleAssignmentRules";
import { buildActorSnapshot } from "../lib/auditHelpers";
import {
  teamRepository,
  type TeamMemberRecord,
  type TeamWithMemberCount,
} from "../repositories/team.repository";
import { authUserRepository } from "../repositories/user.repository";
import { auditService } from "./audit.service";
import { welcomeNotificationService } from "./welcomeNotification.service";
import { assertPasswordStrength } from "../lib/password";
import { authorizeTeamMemberAccess } from "../lib/teamAccess";
import type { AuditMutationContext } from "../types/audit";
import type { AuthUser } from "../types/auth";
import type {
  CreateTeamInput,
  CreateTeamMemberInput,
  ListTeamsQuery,
  PaginatedTeamMembersResponse,
  PaginatedTeamsResponse,
  ParsedListTeamMembersQuery,
  ParsedListTeamsQuery,
  TeamDetailResponse,
  TeamListMembershipFilter,
  TeamListSortBy,
  TeamListSortOrder,
  TeamMember,
  TeamMemberListSortBy,
  TeamMemberListSortOrder,
  TeamSummary,
} from "../types/team";
import { AppError } from "../utils/AppError";

const SALT_ROUNDS = 10;

const DEFAULT_LIST_QUERY = {
  membership: "ALL" as TeamListMembershipFilter,
  sortBy: "createdAt" as TeamListSortBy,
  sortOrder: "desc" as TeamListSortOrder,
  page: 1,
  pageSize: 10,
};

const SORT_BY_VALUES: TeamListSortBy[] = ["name", "memberCount", "createdAt"];
const SORT_ORDER_VALUES: TeamListSortOrder[] = ["asc", "desc"];
const DEFAULT_MEMBER_LIST_QUERY = {
  sortBy: "createdAt" as TeamMemberListSortBy,
  sortOrder: "desc" as TeamMemberListSortOrder,
  page: 1,
  pageSize: 10,
};

const MEMBER_SORT_BY_VALUES: TeamMemberListSortBy[] = [
  "name",
  "email",
  "role",
  "createdAt",
];

const MEMBERSHIP_FILTER_VALUES: TeamListMembershipFilter[] = [
  "ALL",
  "WITH_MEMBERS",
  "EMPTY",
];

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
): ParsedListTeamsQuery => {
  const search = parseQueryValue(rawQuery.search)?.trim();
  const membershipRaw = parseQueryValue(rawQuery.membership)?.toUpperCase();
  const sortByRaw = parseQueryValue(rawQuery.sortBy);
  const sortOrderRaw = parseQueryValue(rawQuery.sortOrder)?.toLowerCase();

  const membership = MEMBERSHIP_FILTER_VALUES.includes(
    membershipRaw as TeamListMembershipFilter,
  )
    ? (membershipRaw as TeamListMembershipFilter)
    : DEFAULT_LIST_QUERY.membership;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as TeamListSortBy)
    ? (sortByRaw as TeamListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as TeamListSortOrder,
  )
    ? (sortOrderRaw as TeamListSortOrder)
    : DEFAULT_LIST_QUERY.sortOrder;

  const page = parsePositiveInt(rawQuery.page, DEFAULT_LIST_QUERY.page);
  const pageSize = Math.min(
    100,
    parsePositiveInt(rawQuery.pageSize, DEFAULT_LIST_QUERY.pageSize),
  );

  return {
    search: search || undefined,
    membership,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

const parseListMembersQuery = (
  rawQuery: Record<string, unknown>,
): ParsedListTeamMembersQuery => {
  const search = parseQueryValue(rawQuery.search)?.trim();
  const roleId = parseQueryValue(rawQuery.roleId)?.trim();
  const sortByRaw = parseQueryValue(rawQuery.sortBy);
  const sortOrderRaw = parseQueryValue(rawQuery.sortOrder)?.toLowerCase();

  const sortBy = MEMBER_SORT_BY_VALUES.includes(sortByRaw as TeamMemberListSortBy)
    ? (sortByRaw as TeamMemberListSortBy)
    : DEFAULT_MEMBER_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as TeamMemberListSortOrder,
  )
    ? (sortOrderRaw as TeamMemberListSortOrder)
    : DEFAULT_MEMBER_LIST_QUERY.sortOrder;

  const page = parsePositiveInt(rawQuery.page, DEFAULT_MEMBER_LIST_QUERY.page);
  const pageSize = Math.min(
    100,
    parsePositiveInt(rawQuery.pageSize, DEFAULT_MEMBER_LIST_QUERY.pageSize),
  );

  return {
    search: search || undefined,
    roleId: roleId || undefined,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

const toTeamSummary = (team: TeamWithMemberCount): TeamSummary => ({
  id: team.id,
  name: team.name,
  memberCount: team._count.members,
  createdAt: team.createdAt.toISOString(),
});

const toTeamMember = (record: TeamMemberRecord): TeamMember => ({
  id: record.user.id,
  name: record.user.name,
  email: record.user.email,
  status: record.user.status,
  role: record.membership?.role
    ? {
        id: record.membership.role.id,
        name: record.membership.role.name,
        slug: record.membership.role.slug,
      }
    : null,
  createdAt: record.user.createdAt.toISOString(),
});

const requireOrganizationId = (organizationId: string | null | undefined) => {
  if (!organizationId) {
    throw AppError.forbidden("Organization context is required");
  }

  return organizationId;
};

export const teamService = {
  listTeams: async (
    organizationId: string | null,
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedTeamsResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const query = parseListQuery(rawQuery);
    const { teams, total } = await teamRepository.findManyPaginated(
      orgId,
      query,
    );

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      teams: teams.map(toTeamSummary),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  getTeam: async (
    organizationId: string | null,
    teamId: string,
  ): Promise<TeamDetailResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const team = await teamRepository.findByIdForOrganization(teamId, orgId);

    if (!team) {
      throw AppError.notFound("Team not found");
    }

    return { team: toTeamSummary(team) };
  },

  createTeam: async (
    organizationId: string | null,
    input: CreateTeamInput,
    auditContext?: AuditMutationContext,
  ): Promise<TeamDetailResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const name = input.name?.trim();

    if (!name) {
      throw AppError.badRequest("Team name is required", [
        { field: "name", message: "Team name is required" },
      ]);
    }

    try {
      const team = await teamRepository.create(orgId, name);

      if (auditContext) {
        auditService.log({
          organizationId: orgId,
          actorId: auditContext.authUser.id,
          action: "TEAM_CREATED",
          entityType: "team",
          entityId: team.id,
          metadata: {
            summary: `Team created: ${team.name}`,
            actor: buildActorSnapshot(auditContext.authUser),
            after: { name: team.name },
          },
          requestContext: auditContext.requestContext,
        });
      }

      return { team: toTeamSummary(team) };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw AppError.badRequest("A team with this name already exists", [
          { field: "name", message: "A team with this name already exists" },
        ]);
      }

      throw error;
    }
  },

  listMembers: async (
    organizationId: string | null,
    teamId: string,
    rawQuery: Record<string, unknown>,
    authUser: AuthUser,
  ): Promise<PaginatedTeamMembersResponse> => {
    const orgId = requireOrganizationId(organizationId);
    authorizeTeamMemberAccess(authUser, teamId, "read");
    const team = await teamRepository.findByIdForOrganization(teamId, orgId);

    if (!team) {
      throw AppError.notFound("Team not found");
    }

    const query = parseListMembersQuery(rawQuery);

    const { members, total } = await teamRepository.findMembersPaginated(
      teamId,
      query,
    );

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      members: members.map(toTeamMember),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  createMember: async (
    organizationId: string | null,
    teamId: string,
    input: CreateTeamMemberInput,
    auditContext?: AuditMutationContext,
  ): Promise<{ member: TeamMember }> => {
    const orgId = requireOrganizationId(organizationId);

    if (!auditContext) {
      throw AppError.forbidden("Auth context is required");
    }

    authorizeTeamMemberAccess(auditContext.authUser, teamId, "write");

    const team = await teamRepository.findByIdForOrganization(teamId, orgId);
    if (!team) {
      throw AppError.notFound("Team not found");
    }

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

    const existingEmail = await authUserRepository.emailExists(email);
    if (existingEmail) {
      throw AppError.badRequest("Email is already in use", [
        { field: "email", message: "Email is already in use" },
      ]);
    }

    const role = await teamRepository.findRoleForOrganization(roleId, orgId);
    if (!role) {
      throw AppError.badRequest("Role is invalid", [
        { field: "roleId", message: "Role is invalid" },
      ]);
    }

    const rules = getRoleAssignmentRules(role);

    try {
      assertRoleAssignableFrom(rules, "team");
    } catch {
      throw AppError.badRequest(
        "This role cannot be assigned from the team page",
        [
          {
            field: "roleId",
            message: "Select a team-scoped role",
          },
        ],
      );
    }

    if (!rules.requiresTeamMembership) {
      throw AppError.badRequest(
        "This role does not require team membership",
        [
          {
            field: "roleId",
            message: "Select a role that belongs on a team",
          },
        ],
      );
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const member = await teamRepository.createMemberWithUser({
        organizationId: orgId,
        teamId,
        name,
        email,
        passwordHash,
        roleId,
      });

      if (auditContext) {
        auditService.log({
          organizationId: orgId,
          actorId: auditContext.authUser.id,
          action: "TEAM_MEMBER_ADDED",
          entityType: "team",
          entityId: teamId,
          metadata: {
            summary: `Team member added: ${member.user.name}`,
            actor: buildActorSnapshot(auditContext.authUser),
            after: { name: member.user.name, email: member.user.email },
            related: {
              team: { id: team.id, name: team.name },
              targetUser: {
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
              },
              role: {
                id: role.id,
                name: role.name,
                slug: role.slug,
              },
            },
          },
          requestContext: auditContext.requestContext,
        });
      }

      await welcomeNotificationService.notifyNewUser(
        member.user.id,
        orgId,
        member.user.name,
      );

      return { member: toTeamMember(member) };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw AppError.badRequest("User is already assigned to a team", [
          {
            field: "email",
            message: "This user is already on a team",
          },
        ]);
      }

      throw error;
    }
  },
};

export type { ListTeamsQuery };
