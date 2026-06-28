-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'PLATFORM_USER_CREATED';

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "organization_id" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_organization_id_fkey";

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "notifications_user_id_organization_id_read_at_idx" ON "notifications"("user_id", "organization_id", "read_at");

-- Insert platform user permissions
INSERT INTO "permissions" ("key", "label", "description", "scope") VALUES
('platform:users:read', 'View platform admins', 'View platform administrator accounts', 'PLATFORM'),
('platform:users:write', 'Manage platform admins', 'Create platform administrator accounts', 'PLATFORM')
ON CONFLICT ("key") DO NOTHING;

-- Grant to existing platform_admin roles
INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'platform:users:read'
FROM "roles" r
WHERE r."organization_id" IS NULL AND r."slug" = 'platform_admin'
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_key")
SELECT r."id", 'platform:users:write'
FROM "roles" r
WHERE r."organization_id" IS NULL AND r."slug" = 'platform_admin'
ON CONFLICT DO NOTHING;
