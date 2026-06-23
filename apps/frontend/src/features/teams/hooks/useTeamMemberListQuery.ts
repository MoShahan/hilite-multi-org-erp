import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";

import {
  clearMemberListFilters,
  parseTeamMemberListParams,
  serializeTeamMemberListParams,
} from "../teamMemberListParams";
import { fetchTeamMembers } from "../teamsSlice";

import type { TeamMemberListQuery } from "../teamsTypes";

export const useTeamMemberListQuery = (teamId: string | undefined) => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parseTeamMemberListParams(searchParams),
    [searchParams],
  );

  const setQuery = useCallback(
    (next: TeamMemberListQuery) => {
      setSearchParams(serializeTeamMemberListParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const patchQuery = useCallback(
    (patch: Partial<TeamMemberListQuery>) => {
      const next = { ...query, ...patch };
      const shouldResetPage =
        ("search" in patch ||
          "roleId" in patch ||
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
    setQuery(clearMemberListFilters(query));
  }, [query, setQuery]);

  const refetch = useCallback(() => {
    if (!teamId) return;
    void dispatch(fetchTeamMembers({ teamId, query }));
  }, [dispatch, query, teamId]);

  useEffect(() => {
    if (!teamId) return;
    void dispatch(fetchTeamMembers({ teamId, query }));
  }, [dispatch, query, teamId]);

  return {
    query,
    patchQuery,
    clearFilters,
    refetch,
  };
};
