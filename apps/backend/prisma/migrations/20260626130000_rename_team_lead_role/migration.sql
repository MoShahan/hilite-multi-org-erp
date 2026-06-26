UPDATE "roles" SET "name" = 'Team Leader' WHERE "slug" = 'team_lead';

UPDATE "permissions" SET "label" = 'View leads in team' WHERE "key" = 'leads:read:team';
UPDATE "permissions" SET "label" = 'Update leads in team' WHERE "key" = 'leads:status:write:team';
