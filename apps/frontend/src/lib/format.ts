import type { UserRole } from "@/features/auth/authTypes";

export const formatRoleLabel = (role: UserRole) => {
  return role
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};
