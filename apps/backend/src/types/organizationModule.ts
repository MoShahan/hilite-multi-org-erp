import type { OrgModuleKey } from "../constants/orgModules";

export type OrgModulesMap = Record<OrgModuleKey, boolean>;

export type OrgModuleCatalogItem = {
  key: OrgModuleKey;
  label: string;
  description: string;
  disableHint: string;
};

export type OrgModulesResponse = {
  modules: OrgModulesMap;
  catalog: OrgModuleCatalogItem[];
};

export type UpdateOrgModulesInput = {
  modules: Partial<OrgModulesMap>;
};
