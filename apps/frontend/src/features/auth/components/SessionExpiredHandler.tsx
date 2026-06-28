import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";
import { registerSessionExpiredHandler } from "@/lib/api-client";

import { logout } from "../authSlice";

export const SessionExpiredHandler = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    registerSessionExpiredHandler(async () => {
      await dispatch(logout());

      if (window.location.pathname === "/login") {
        return;
      }

      navigate("/login", {
        replace: true,
        state: { from: window.location.pathname },
      });
    });
  }, [dispatch, navigate]);

  return null;
};
