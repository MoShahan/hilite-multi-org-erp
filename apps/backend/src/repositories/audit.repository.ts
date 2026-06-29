import {
  Prisma,
  type AuditAction,
  type AuditLog,
} from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

import type {
  CreateAuditLogInput,
  ParsedListAuditLogsQuery,
} from "../types/audit";

const auditLogInclude = {
  organization: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  actor: {
    select: {
      id: true,
      name: true,
      email: true,
      userRole: {
        select: {
          role: {
            select: { slug: true },
          },
        },
      },
    },
  },
} satisfies Prisma.AuditLogInclude;

type AuditLogRecord = Prisma.AuditLogGetPayload<{
  include: typeof auditLogInclude;
}>;

const buildWhere = (
  query: ParsedListAuditLogsQuery,
  organizationId?: string,
): Prisma.AuditLogWhereInput => {
  const where: Prisma.AuditLogWhereInput = {};

  if (organizationId) {
    where.organizationId = organizationId;
  } else if (query.organizationId) {
    where.organizationId = query.organizationId;
  }

  if (query.action) {
    where.action = query.action;
  }

  if (query.actorId) {
    where.actorId = query.actorId;
  }

  if (query.entityType) {
    where.entityType = query.entityType;
  }

  if (query.entityId) {
    where.entityId = query.entityId;
  }

  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }

  if (query.search) {
    where.OR = [
      {
        metadata: {
          path: ["summary"],
          string_contains: query.search,
          mode: "insensitive",
        },
      },
      {
        actor: {
          name: { contains: query.search, mode: "insensitive" },
        },
      },
      {
        actor: {
          email: { contains: query.search, mode: "insensitive" },
        },
      },
    ];
  }

  return where;
};

export const auditRepository = {
  create: async (input: CreateAuditLogInput): Promise<AuditLog> => {
    return prisma.auditLog.create({
      data: {
        organizationId: input.organizationId ?? null,
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata as Prisma.InputJsonValue,
      },
    });
  },

  findPaginated: async (
    query: ParsedListAuditLogsQuery,
    organizationId?: string,
  ): Promise<{ auditLogs: AuditLogRecord[]; total: number }> => {
    const where = buildWhere(query, organizationId);
    const skip = (query.page - 1) * query.pageSize;

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: auditLogInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { auditLogs, total };
  },

  findForEntityActions: async (
    organizationId: string,
    entityType: string,
    entityId: string,
    actions: AuditAction[],
  ): Promise<AuditLogRecord[]> => {
    return prisma.auditLog.findMany({
      where: {
        organizationId,
        entityType,
        entityId,
        action: { in: actions },
      },
      include: auditLogInclude,
      orderBy: { createdAt: "desc" },
    });
  },
};

export type { AuditLogRecord };
