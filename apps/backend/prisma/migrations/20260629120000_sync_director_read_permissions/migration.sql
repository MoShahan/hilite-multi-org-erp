-- Sync director role read permissions for users, teams, and roles
INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", p."key"
FROM "roles" r
CROSS JOIN (VALUES ('users:read'), ('teams:read'), ('roles:read')) AS p("key")
WHERE r."slug" = 'director'
ON CONFLICT DO NOTHING;
