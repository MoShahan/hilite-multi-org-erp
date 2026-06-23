import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";

import {
  clearListFilters,
  parseTeamListParams,
  serializeTeamListParams,
} from "../teamListParams";
import { fetchTeams } from "../teamsSlice";

import type { TeamListQuery } from "../teamsTypes";

export const useTeamListQuery = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parseTeamListParams(searchParams),
    [searchParams],
  );

  const setQuery = useCallback(
    (next: TeamListQuery) => {
      setSearchParams(serializeTeamListParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const patchQuery = useCallback(
    (patch: Partial<TeamListQuery>) => {
      const next = { ...query, ...patch };
      const shouldResetPage =
        ("search" in patch ||
          "membership" in patch ||
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
    void dispatch(fetchTeams(query));
  }, [dispatch, query]);

  useEffect(() => {
    void dispatch(fetchTeams(query));
  }, [dispatch, query]);

  return {
    query,
    patchQuery,
    clearFilters,
    refetch,
    listSearch: searchParams.toString() ? `?${searchParams.toString()}` : "",
  };
};
