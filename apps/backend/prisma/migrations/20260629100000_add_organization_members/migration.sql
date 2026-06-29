-- CreateTable
CREATE TABLE "organization_members" (
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("user_id","organization_id")
);

-- Backfill organization_members from users + user_roles
INSERT INTO "organization_members" ("user_id", "organization_id", "role_id", "status", "joined_at")
SELECT u."id", u."organization_id", ur."role_id", u."status", u."created_at"
FROM "users" u
INNER JOIN "user_roles" ur ON ur."user_id" = u."id"
WHERE u."organization_id" IS NOT NULL;

-- Add organization_id to team_members and backfill from teams
ALTER TABLE "team_members" ADD COLUMN "organization_id" TEXT;

UPDATE "team_members" tm
SET "organization_id" = t."organization_id"
FROM "teams" t
WHERE tm."team_id" = t."id";

ALTER TABLE "team_members" ALTER COLUMN "organization_id" SET NOT NULL;

-- Drop global one-team-per-user constraint; add per-org constraint
DROP INDEX IF EXISTS "team_members_user_id_key";

CREATE UNIQUE INDEX "team_members_user_id_organization_id_key" ON "team_members"("user_id", "organization_id");

-- Remove org-user role assignments (platform admins keep user_roles rows)
DELETE FROM "user_roles" ur
USING "users" u
WHERE ur."user_id" = u."id" AND u."organization_id" IS NOT NULL;

-- Drop users.organization_id
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_organization_id_fkey";
DROP INDEX IF EXISTS "users_organization_id_idx";
ALTER TABLE "users" DROP COLUMN "organization_id";

-- CreateIndex
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members"("organization_id");

-- CreateIndex
CREATE INDEX "organization_members_role_id_idx" ON "organization_members"("role_id");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_organization_id_fkey" FOREIGN KEY ("user_id", "organization_id") REFERENCES "organization_members"("user_id", "organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
