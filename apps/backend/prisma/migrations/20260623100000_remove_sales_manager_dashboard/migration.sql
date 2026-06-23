DELETE FROM "role_permissions"
WHERE "permission_key" = 'dashboard:team_lead'
  AND "role_id" IN (SELECT "id" FROM "roles" WHERE "slug" = 'sales_manager');
