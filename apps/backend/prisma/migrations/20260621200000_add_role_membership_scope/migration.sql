-- CreateEnum
CREATE TYPE "RoleMembershipScope" AS ENUM ('TEAM', 'ORGANIZATION');

-- AlterTable
ALTER TABLE "roles" ADD COLUMN "membership_scope" "RoleMembershipScope" NOT NULL DEFAULT 'ORGANIZATION';

-- Backfill team-based default roles
UPDATE "roles" SET "membership_scope" = 'TEAM' WHERE "slug" IN ('team_lead', 'sales_manager');
