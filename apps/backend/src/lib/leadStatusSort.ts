import { getLeadStatusSortIndex } from "@hilite/shared";

import type { LeadStatus } from "../generated/prisma/client";

type LeadStatusRow = { id: string; status: LeadStatus };

const UNKNOWN_STATUS_SORT_INDEX = 999;

const compareByStatusIndex = (
  a: LeadStatusRow,
  b: LeadStatusRow,
  sortOrder: "asc" | "desc",
): number => {
  const aIndex = getLeadStatusSortIndex(a.status);
  const bIndex = getLeadStatusSortIndex(b.status);
  const aSortIndex = aIndex === -1 ? UNKNOWN_STATUS_SORT_INDEX : aIndex;
  const bSortIndex = bIndex === -1 ? UNKNOWN_STATUS_SORT_INDEX : bIndex;
  const diff = aSortIndex - bSortIndex;

  return sortOrder === "asc" ? diff : -diff;
};

export const sortLeadRowsByStatus = (
  rows: LeadStatusRow[],
  sortOrder: "asc" | "desc",
  skip: number,
  take: number,
): string[] =>
  [...rows]
    .sort((a, b) => compareByStatusIndex(a, b, sortOrder))
    .slice(skip, skip + take)
    .map((row) => row.id);
