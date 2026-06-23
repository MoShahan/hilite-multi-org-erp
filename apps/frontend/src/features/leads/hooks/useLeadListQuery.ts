import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectHasModule } from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";

import {
  clearListFilters,
  parseLeadListParams,
  serializeLeadListParams,
} from "../leadListParams";
import { fetchLeads } from "../leadsSlice";

import type { LeadListQuery } from "../leadsTypes";

export const useLeadListQuery = () => {
  const dispatch = useAppDispatch();
  const hasSalesErpModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.SALES_ERP),
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parseLeadListParams(searchParams),
    [searchParams],
  );

  const setQuery = useCallback(
    (next: LeadListQuery) => {
      setSearchParams(serializeLeadListParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const patchQuery = useCallback(
    (patch: Partial<LeadListQuery>) => {
      const next = { ...query, ...patch };
      const shouldResetPage =
        ("search" in patch ||
          "status" in patch ||
          "teamId" in patch ||
          "assignedToId" in patch ||
          "sortBy" in patch ||
          "sortOrder" in patch ||
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
    setQuery(clearListFilters(query));
  }, [query, setQuery]);

  const refetch = useCallback(() => {
    void dispatch(fetchLeads(query));
  }, [dispatch, query]);

  useEffect(() => {
    if (!hasSalesErpModule) {
      return;
    }

    void dispatch(fetchLeads(query));
  }, [dispatch, hasSalesErpModule, query]);

  return {
    query,
    setQuery,
    patchQuery,
    clearFilters,
    refetch,
    listSearch: searchParams.toString() ? `?${searchParams.toString()}` : "",
  };
};
