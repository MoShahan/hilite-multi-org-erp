import { useEffect, useRef } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";

import { selectAuthStatus } from "../authSelectors";
import { fetchMe } from "../authSlice";

export const AuthBootstrap = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current || status !== "idle") {
      return;
    }

    hasBootstrapped.current = true;
    void dispatch(fetchMe());
  }, [dispatch, status]);

  return null;
};
