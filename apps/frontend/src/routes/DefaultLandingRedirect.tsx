import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { selectDefaultLandingPath } from "@/lib/defaultLandingPath";

export const DefaultLandingRedirect = () => {
  const path = useAppSelector(selectDefaultLandingPath);

  return <Navigate to={path} replace />;
};
