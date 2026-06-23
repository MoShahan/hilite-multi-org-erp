INSERT INTO "permissions" ("key", "label", "description", "scope")
VALUES
  (
    'leads:status:write',
    'Update own lead status',
    'Change status on leads assigned to the user',
    'ORGANIZATION'
  ),
  (
    'leads:status:write:team',
    'Update team lead status',
    'Change status on leads belonging to the caller''s team',
    'ORGANIZATION'
  )
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'leads:status:write'
FROM "roles" r
WHERE r."slug" = 'executive'
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'leads:status:write:team'
FROM "roles" r
WHERE r."slug" = 'team_lead'
ON CONFLICT DO NOTHING;
