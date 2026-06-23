-- One team per user
CREATE UNIQUE INDEX "team_members_user_id_key" ON "team_members"("user_id");

-- Unique team name within org
CREATE UNIQUE INDEX "teams_organization_id_name_key" ON "teams"("organization_id", "name");

-- Backfill role membership scopes
UPDATE "roles" SET "membership_scope" = 'TEAM' WHERE "slug" = 'executive';
UPDATE "roles" SET "membership_scope" = 'ORGANIZATION' WHERE "slug" = 'sales_manager';
