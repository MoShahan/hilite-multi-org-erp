INSERT INTO "permissions" ("key", "label", "description", "scope")
VALUES (
  'roles:read:team',
  'View team roles',
  'View team-assignable roles and their permissions',
  'ORGANIZATION'
)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'roles:read:team'
FROM "roles" r
WHERE r."slug" = 'team_lead'
ON CONFLICT DO NOTHING;
