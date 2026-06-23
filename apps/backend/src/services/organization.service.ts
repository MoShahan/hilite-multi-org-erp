import bcrypt from "bcrypt";
import { OrganizationStatus } from "../generated/prisma/client";
import {
  organizationRepository,
  type OrganizationWithUserCount,
} from "../repositories/organization.repository";
import { authUserRepository } from "../repositories/user.repository";
import type {
  CreateOrganizationInput,
  ListOrganizationsQuery,
  OrganizationListSortBy,
  OrganizationListSortOrder,
  OrganizationListStatusFilter,
  OrganizationResponse,
  PaginatedOrganizationsResponse,
  ParsedListOrganizationsQuery,
  UpdateOrganizationInput,
  UpdateOrganizationStatusInput,
} from "../types/organization";
import { AppError } from "../utils/AppError";

const SALT_ROUNDS = 10;
const CODE_PATTERN = /^[a-z0-9-]+$/;

const DEFAULT_LIST_QUERY = {
  status: "ALL" as OrganizationListStatusFilter,
  sortBy: "createdAt" as OrganizationListSortBy,
  sortOrder: "desc" as OrganizationListSortOrder,
  page: 1,
  pageSize: 10,
};

const SORT_BY_VALUES: OrganizationListSortBy[] = [
  "name",
  "code",
  "status",
  "userCount",
  "createdAt",
];

const SORT_ORDER_VALUES: OrganizationListSortOrder[] = ["asc", "desc"];

const STATUS_FILTER_VALUES: OrganizationListStatusFilter[] = [
  "ALL",
  "ACTIVE",
  "SUSPENDED",
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
): ParsedListOrganizationsQuery => {
  const search = parseQueryValue(rawQuery.search)?.trim();
  const statusRaw = parseQueryValue(rawQuery.status)?.toUpperCase();
  const sortByRaw = parseQueryValue(rawQuery.sortBy);
  const sortOrderRaw = parseQueryValue(rawQuery.sortOrder)?.toLowerCase();

  const status = STATUS_FILTER_VALUES.includes(
    statusRaw as OrganizationListStatusFilter,
  )
    ? (statusRaw as OrganizationListStatusFilter)
    : DEFAULT_LIST_QUERY.status;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as OrganizationListSortBy)
    ? (sortByRaw as OrganizationListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as OrganizationListSortOrder,
  )
    ? (sortOrderRaw as OrganizationListSortOrder)
    : DEFAULT_LIST_QUERY.sortOrder;

  const page = parsePositiveInt(rawQuery.page, DEFAULT_LIST_QUERY.page);
  const pageSize = Math.min(
    100,
    parsePositiveInt(rawQuery.pageSize, DEFAULT_LIST_QUERY.pageSize),
  );

  return {
    search: search || undefined,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

const toOrganizationResponse = (
  organization: OrganizationWithUserCount,
): OrganizationResponse => ({
  id: organization.id,
  name: organization.name,
  code: organization.code,
  logoUrl: organization.logoUrl,
  description: organization.description,
  status: organization.status,
  userCount: organization._count.users,
  createdAt: organization.createdAt.toISOString(),
  updatedAt: organization.updatedAt.toISOString(),
});

const normalizeCode = (code: string) => code.trim().toLowerCase();

const validateCode = (code: string) => {
  if (!CODE_PATTERN.test(code)) {
    throw new AppError(400, "BAD_REQUEST", "Organization code is invalid", [
      {
        field: "code",
        message: "Code must contain only lowercase letters, numbers, and hyphens",
      },
    ]);
  }
};

const validateCreateInput = async (input: CreateOrganizationInput) => {
  const name = input.name?.trim();
  const code = normalizeCode(input.code ?? "");
  const orgAdminName = input.orgAdmin?.name?.trim();
  const orgAdminEmail = input.orgAdmin?.email?.trim().toLowerCase();
  const orgAdminPassword = input.orgAdmin?.password;

  if (!name) {
    throw AppError.badRequest("Organization name is required", [
      { field: "name", message: "Organization name is required" },
    ]);
  }

  if (!code) {
    throw AppError.badRequest("Organization code is required", [
      { field: "code", message: "Organization code is required" },
    ]);
  }

  validateCode(code);

  if (!orgAdminName) {
    throw AppError.badRequest("Org admin name is required", [
      { field: "orgAdmin.name", message: "Org admin name is required" },
    ]);
  }

  if (!orgAdminEmail) {
    throw AppError.badRequest("Org admin email is required", [
      { field: "orgAdmin.email", message: "Org admin email is required" },
    ]);
  }

  if (!orgAdminPassword || orgAdminPassword.length < 8) {
    throw AppError.badRequest("Org admin password must be at least 8 characters", [
      {
        field: "orgAdmin.password",
        message: "Password must be at least 8 characters",
      },
    ]);
  }

  const existingOrg = await organizationRepository.findByCode(code);

  if (existingOrg) {
    throw new AppError(400, "ORG_CODE_EXISTS", "Organization code already exists", [
      { field: "code", message: "This organization code is already taken" },
    ]);
  }

  const existingUser = await authUserRepository.findByEmail(orgAdminEmail);

  if (existingUser) {
    throw new AppError(400, "EMAIL_EXISTS", "Email already exists", [
      { field: "orgAdmin.email", message: "This email is already registered" },
    ]);
  }

  return {
    name,
    code,
    description: input.description?.trim() || null,
    logoUrl: input.logoUrl?.trim() || null,
    orgAdmin: {
      name: orgAdminName,
      email: orgAdminEmail,
      password: orgAdminPassword,
    },
  };
};

export const organizationService = {
  parseListQuery,

  listOrganizations: async (
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedOrganizationsResponse> => {
    const query = parseListQuery(rawQuery);
    const { organizations, total } =
      await organizationRepository.findManyPaginated(query);

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);

    return {
      organizations: organizations.map(toOrganizationResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  getOrganization: async (id: string): Promise<OrganizationResponse> => {
    const organization = await organizationRepository.findById(id);

    if (!organization) {
      throw new AppError(404, "ORG_NOT_FOUND", "Organization not found");
    }

    return toOrganizationResponse(organization);
  },

  createOrganization: async (
    input: CreateOrganizationInput,
  ): Promise<OrganizationResponse> => {
    const validated = await validateCreateInput(input);
    const passwordHash = await bcrypt.hash(validated.orgAdmin.password, SALT_ROUNDS);

    const organization = await organizationRepository.createWithOrgAdmin({
      organization: {
        name: validated.name,
        code: validated.code,
        description: validated.description,
        logoUrl: validated.logoUrl,
      },
      orgAdmin: {
        name: validated.orgAdmin.name,
        email: validated.orgAdmin.email,
        passwordHash,
      },
    });

    return toOrganizationResponse(organization);
  },

  updateOrganization: async (
    id: string,
    input: UpdateOrganizationInput,
  ): Promise<OrganizationResponse> => {
    const existing = await organizationRepository.findById(id);

    if (!existing) {
      throw new AppError(404, "ORG_NOT_FOUND", "Organization not found");
    }

    const updateData: {
      name?: string;
      code?: string;
      description?: string | null;
      logoUrl?: string | null;
    } = {};

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (!name) {
        throw AppError.badRequest("Organization name is required", [
          { field: "name", message: "Organization name is required" },
        ]);
      }

      updateData.name = name;
    }

    if (input.code !== undefined) {
      const code = normalizeCode(input.code);

      if (!code) {
        throw AppError.badRequest("Organization code is required", [
          { field: "code", message: "Organization code is required" },
        ]);
      }

      validateCode(code);

      if (code !== existing.code) {
        const duplicate = await organizationRepository.findByCode(code);

        if (duplicate) {
          throw new AppError(
            400,
            "ORG_CODE_EXISTS",
            "Organization code already exists",
            [{ field: "code", message: "This organization code is already taken" }],
          );
        }
      }

      updateData.code = code;
    }

    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }

    if (input.logoUrl !== undefined) {
      updateData.logoUrl = input.logoUrl?.trim() || null;
    }

    const organization = await organizationRepository.update(id, updateData);
    return toOrganizationResponse(organization);
  },

  updateOrganizationStatus: async (
    id: string,
    input: UpdateOrganizationStatusInput,
  ): Promise<OrganizationResponse> => {
    const existing = await organizationRepository.findById(id);

    if (!existing) {
      throw new AppError(404, "ORG_NOT_FOUND", "Organization not found");
    }

    if (
      input.status !== OrganizationStatus.ACTIVE &&
      input.status !== OrganizationStatus.SUSPENDED
    ) {
      throw AppError.badRequest("Invalid organization status");
    }

    if (existing.status === input.status) {
      return toOrganizationResponse(existing);
    }

    const organization = await organizationRepository.updateStatus(
      id,
      input.status,
    );

    return toOrganizationResponse(organization);
  },
};
