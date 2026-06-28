-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'WELCOME_CHANGE_PASSWORD';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false;
