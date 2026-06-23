-- Sync executive role permissions for leads
DELETE FROM "role_permissions"
WHERE "permission_key" = 'leads:write'
  AND "role_id" IN (SELECT "id" FROM "roles" WHERE "slug" = 'executive');

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'leads:assignable'
FROM "roles" r
WHERE r."slug" = 'executive'
ON CONFLICT DO NOTHING;

-- Sync team_lead role permissions
DELETE FROM "role_permissions"
WHERE "permission_key" IN ('leads:read', 'activities:write')
  AND "role_id" IN (SELECT "id" FROM "roles" WHERE "slug" = 'team_lead');

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", p."key"
FROM "roles" r
CROSS JOIN (VALUES ('leads:read:team'), ('leads:write')) AS p("key")
WHERE r."slug" = 'team_lead'
ON CONFLICT DO NOTHING;

-- Sync sales_manager role permissions
DELETE FROM "role_permissions"
WHERE "permission_key" IN ('leads:read', 'leads:read:team', 'activities:write')
  AND "role_id" IN (SELECT "id" FROM "roles" WHERE "slug" = 'sales_manager');

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", p."key"
FROM "roles" r
CROSS JOIN (VALUES ('leads:read:org'), ('leads:write')) AS p("key")
WHERE r."slug" = 'sales_manager'
ON CONFLICT DO NOTHING;

-- Sync director role permissions
DELETE FROM "role_permissions"
WHERE "permission_key" IN ('leads:read', 'activities:write')
  AND "role_id" IN (SELECT "id" FROM "roles" WHERE "slug" = 'director');

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", p."key"
FROM "roles" r
CROSS JOIN (VALUES ('leads:read:org'), ('leads:write')) AS p("key")
WHERE r."slug" = 'director'
ON CONFLICT DO NOTHING;

-- Sync org_admin read-only org leads
INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'leads:read:org'
FROM "roles" r
WHERE r."slug" = 'org_admin'
ON CONFLICT DO NOTHING;
