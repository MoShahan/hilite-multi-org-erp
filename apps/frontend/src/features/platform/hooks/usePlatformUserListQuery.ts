import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";

import {
  clearPlatformUserListFilters,
  parsePlatformUserListParams,
  serializePlatformUserListParams,
} from "../platformUserListParams";
import { fetchPlatformUsers } from "../platformSlice";

import type { PlatformUserListQuery } from "../platformTypes";

export const usePlatformUserListQuery = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parsePlatformUserListParams(searchParams),
    [searchParams],
  );

  const setQuery = useCallback(
    (next: PlatformUserListQuery) => {
      setSearchParams(serializePlatformUserListParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const patchQuery = useCallback(
    (patch: Partial<PlatformUserListQuery>) => {
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
    setQuery(clearPlatformUserListFilters(query));
  }, [query, setQuery]);

  const refetch = useCallback(() => {
    void dispatch(fetchPlatformUsers(query));
  }, [dispatch, query]);

  useEffect(() => {
    void dispatch(fetchPlatformUsers(query));
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
