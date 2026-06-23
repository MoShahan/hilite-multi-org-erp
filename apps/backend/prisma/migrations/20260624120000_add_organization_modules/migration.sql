-- CreateEnum
CREATE TYPE "ModuleKey" AS ENUM ('SALES_ERP', 'DASHBOARDS', 'NOTIFICATIONS');

-- CreateTable
CREATE TABLE "organization_modules" (
    "organization_id" TEXT NOT NULL,
    "module_key" "ModuleKey" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_modules_pkey" PRIMARY KEY ("organization_id","module_key")
);

-- AddForeignKey
ALTER TABLE "organization_modules" ADD CONSTRAINT "organization_modules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing organizations with all modules enabled
INSERT INTO "organization_modules" ("organization_id", "module_key", "enabled", "updated_at")
SELECT o."id", m."module_key", true, CURRENT_TIMESTAMP
FROM "organizations" o
CROSS JOIN (
    VALUES
        ('SALES_ERP'::"ModuleKey"),
        ('DASHBOARDS'::"ModuleKey"),
        ('NOTIFICATIONS'::"ModuleKey")
) AS m("module_key")
ON CONFLICT ("organization_id", "module_key") DO NOTHING;
