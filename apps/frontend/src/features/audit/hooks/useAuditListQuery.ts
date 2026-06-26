import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";

import {
  clearAuditListFilters,
  parseAuditListParams,
  serializeAuditListParams,
} from "../auditListParams";
import { fetchAuditLogs } from "../auditSlice";

import type { AuditListQuery } from "../auditTypes";

export const useAuditListQuery = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parseAuditListParams(searchParams),
    [searchParams],
  );

  const setQuery = useCallback(
    (next: AuditListQuery) => {
      setSearchParams(serializeAuditListParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const patchQuery = useCallback(
    (patch: Partial<AuditListQuery>) => {
      const next = { ...query, ...patch };
      const shouldResetPage =
        ("search" in patch ||
          "action" in patch ||
          "entityType" in patch ||
          "from" in patch ||
          "to" in patch ||
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
    setQuery(clearAuditListFilters(query));
  }, [query, setQuery]);

  const refetch = useCallback(() => {
    void dispatch(fetchAuditLogs(query));
  }, [dispatch, query]);

  useEffect(() => {
    void dispatch(fetchAuditLogs(query));
  }, [dispatch, query]);

  return {
    query,
    patchQuery,
    clearFilters,
    refetch,
  };
};
