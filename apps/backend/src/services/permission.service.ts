import { getPermissionCatalogEntry } from "../constants/permissionMembership";
import { PermissionScope } from "../generated/prisma/client";
import { permissionRepository } from "../repositories/permission.repository";

import type { ListPermissionsResponse } from "../types/permission";

export const permissionService = {
  listPermissions: async (): Promise<ListPermissionsResponse> => {
    const permissions = await permissionRepository.findAll(
      PermissionScope.ORGANIZATION,
    );

    return {
      permissions: permissions.map((permission) => {
        const catalogEntry = getPermissionCatalogEntry(permission.key);

        return {
          key: permission.key,
          label: permission.label,
          description: permission.description,
          scope: permission.scope,
          grantScope: catalogEntry?.grantScope,
        };
      }),
    };
  },
};
