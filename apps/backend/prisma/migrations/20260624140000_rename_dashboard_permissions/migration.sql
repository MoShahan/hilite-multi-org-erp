-- Insert scope-based dashboard permissions
INSERT INTO "permissions" ("key", "label", "description", "scope") VALUES
('dashboard:me', 'My dashboard', 'Access personal sales analytics', 'ORGANIZATION'),
('dashboard:team', 'Team dashboard', 'Access team sales analytics', 'ORGANIZATION'),
('dashboard:org', 'Organization dashboard', 'Access organization-wide sales analytics', 'ORGANIZATION')
ON CONFLICT ("key") DO NOTHING;

-- Copy role grants from old permission keys
INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT "role_id", 'dashboard:me' FROM "role_permissions" WHERE "permission_key" = 'dashboard:executive'
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT "role_id", 'dashboard:team' FROM "role_permissions" WHERE "permission_key" = 'dashboard:team_lead'
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT "role_id", 'dashboard:org' FROM "role_permissions" WHERE "permission_key" = 'dashboard:director'
ON CONFLICT DO NOTHING;

-- Remove old role grants
DELETE FROM "role_permissions"
WHERE "permission_key" IN ('dashboard:executive', 'dashboard:team_lead', 'dashboard:director');

-- Remove old permission catalog rows
DELETE FROM "permissions"
WHERE "key" IN ('dashboard:executive', 'dashboard:team_lead', 'dashboard:director');
