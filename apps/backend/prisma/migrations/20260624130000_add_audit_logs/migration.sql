-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM (
  'AUTH_LOGIN_SUCCESS',
  'AUTH_LOGIN_FAILED',
  'AUTH_LOGOUT',
  'LEAD_CREATED',
  'LEAD_UPDATED',
  'LEAD_STATUS_CHANGED',
  'LEAD_ASSIGNED',
  'LEAD_REASSIGNED',
  'LEAD_UNASSIGNED',
  'ACTIVITY_LOGGED',
  'USER_CREATED',
  'USER_ACTIVATED',
  'USER_DEACTIVATED',
  'TEAM_CREATED',
  'TEAM_MEMBER_ADDED',
  'ROLE_CREATED',
  'ROLE_UPDATED',
  'ROLE_DELETED',
  'ORG_CREATED',
  'ORG_UPDATED',
  'ORG_STATUS_CHANGED',
  'ORG_MODULES_UPDATED'
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "actor_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_created_at_idx" ON "audit_logs"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed audit permissions
INSERT INTO "permissions" ("key", "label", "description", "scope")
VALUES
  ('audit:read', 'View audit trail', 'View the organization audit trail', 'ORGANIZATION'),
  ('platform:audit:read', 'View platform audit trail', 'View audit events across all organizations', 'PLATFORM')
ON CONFLICT ("key") DO NOTHING;

-- Grant audit:read to org_admin roles
INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'audit:read'
FROM "roles" r
WHERE r."slug" = 'org_admin'
ON CONFLICT DO NOTHING;

-- Grant platform:audit:read to platform_admin role
INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'platform:audit:read'
FROM "roles" r
WHERE r."slug" = 'platform_admin' AND r."organization_id" IS NULL
ON CONFLICT DO NOTHING;
