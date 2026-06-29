import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";
import {
  clearPlatformAuditListFilters,
  parsePlatformAuditListParams,
  serializePlatformAuditListParams,
} from "@/features/audit/auditListParams";

import { fetchPlatformAuditLogs } from "../platformSlice";

import type { PlatformAuditListQuery } from "../platformTypes";

export const usePlatformAuditListQuery = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parsePlatformAuditListParams(searchParams),
    [searchParams],
  );

  const setQuery = useCallback(
    (next: PlatformAuditListQuery) => {
      setSearchParams(serializePlatformAuditListParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const patchQuery = useCallback(
    (patch: Partial<PlatformAuditListQuery>) => {
      const next = { ...query, ...patch };
      const shouldResetPage =
        ("search" in patch ||
          "action" in patch ||
          "entityType" in patch ||
          "from" in patch ||
          "to" in patch ||
          "organizationId" in patch ||
          "pageSize" in patch) &&
        !("page" in patch);

      if (shouldResetPage) {
        next.page = 1;
      }

      setQuery(next);
    },
    [query, setQuery],
  );

  const clearFilters = useCallback(() => {
    setQuery(clearPlatformAuditListFilters(query));
  }, [query, setQuery]);

  const refetch = useCallback(() => {
    void dispatch(fetchPlatformAuditLogs(query));
  }, [dispatch, query]);

  useEffect(() => {
    void dispatch(fetchPlatformAuditLogs(query));
  }, [dispatch, query]);

  return {
    query,
    patchQuery,
    clearFilters,
    refetch,
  };
};
