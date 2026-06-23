export type ApiGrantScope = "team" | "org_wide";

export type PermissionResponse = {
  key: string;
  label: string;
  description: string | null;
  scope: "PLATFORM" | "ORGANIZATION";
  grantScope?: ApiGrantScope;
};

export type ListPermissionsResponse = {
  permissions: PermissionResponse[];
};
