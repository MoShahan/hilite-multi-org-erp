INSERT INTO "permissions" ("key", "label", "description", "scope")
VALUES (
  'users:write:team',
  'Manage team users',
  'Create users on the caller''s team',
  'ORGANIZATION'
)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'users:write:team'
FROM "roles" r
WHERE r."slug" = 'team_lead'
ON CONFLICT DO NOTHING;
