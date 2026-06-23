import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";

import {
  clearListFilters,
  parseUserListParams,
  serializeUserListParams,
} from "../userListParams";
import { fetchUsers } from "../usersSlice";

import type { UserListQuery } from "../usersTypes";

export const useUserListQuery = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parseUserListParams(searchParams),
    [searchParams],
  );

  const setQuery = useCallback(
    (next: UserListQuery) => {
      setSearchParams(serializeUserListParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const patchQuery = useCallback(
    (patch: Partial<UserListQuery>) => {
      const next = { ...query, ...patch };
      const shouldResetPage =
        ("search" in patch ||
          "status" in patch ||
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
    void dispatch(fetchUsers(query));
  }, [dispatch, query]);

  useEffect(() => {
    void dispatch(fetchUsers(query));
  }, [dispatch, query]);

  return {
    query,
    setQuery,
    patchQuery,
    clearFilters,
    refetch,
    listSearch: searchParams.toString() ? `?${searchParams.toString()}` : "",
  };
};
