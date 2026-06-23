-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('PLATFORM', 'ORGANIZATION');

-- CreateTable
CREATE TABLE "permissions" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "scope" "PermissionScope" NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("key")
);

-- Seed permission catalog
INSERT INTO "permissions" ("key", "label", "description", "scope") VALUES
('platform:orgs:read', 'View organizations', 'View all organizations on the platform', 'PLATFORM'),
('platform:orgs:write', 'Manage organizations', 'Create and update organizations on the platform', 'PLATFORM'),
('users:read', 'View users', 'View users in the organization', 'ORGANIZATION'),
('users:write', 'Manage users', 'Create, update, and deactivate users', 'ORGANIZATION'),
('teams:read', 'View teams', 'View teams in the organization', 'ORGANIZATION'),
('teams:write', 'Manage teams', 'Create and update teams and memberships', 'ORGANIZATION'),
('roles:read', 'View roles', 'View roles and their permissions', 'ORGANIZATION'),
('roles:write', 'Manage roles', 'Create and update roles and permissions', 'ORGANIZATION'),
('leads:read', 'View own leads', 'View leads assigned to the user', 'ORGANIZATION'),
('leads:read:team', 'View team leads', 'View leads assigned to team members', 'ORGANIZATION'),
('leads:read:org', 'View all org leads', 'View all leads in the organization', 'ORGANIZATION'),
('leads:write', 'Manage leads', 'Create and update leads', 'ORGANIZATION'),
('activities:write', 'Log activities', 'Create activities on leads', 'ORGANIZATION'),
('dashboard:executive', 'Executive dashboard', 'Access the executive dashboard', 'ORGANIZATION'),
('dashboard:team_lead', 'Team lead dashboard', 'Access the team lead dashboard', 'ORGANIZATION'),
('dashboard:director', 'Director dashboard', 'Access the director dashboard', 'ORGANIZATION');

-- Migrate role_permissions to FK
ALTER TABLE "role_permissions" ADD COLUMN "permission_key" TEXT;

UPDATE "role_permissions" SET "permission_key" = "permission";

ALTER TABLE "role_permissions" ALTER COLUMN "permission_key" SET NOT NULL;

ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey";
ALTER TABLE "role_permissions" DROP COLUMN "permission";

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_key");

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_key_fkey" FOREIGN KEY ("permission_key") REFERENCES "permissions"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
