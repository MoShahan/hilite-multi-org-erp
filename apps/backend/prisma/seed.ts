import bcrypt from "bcrypt";
import {
  OrganizationStatus,
  UserRole,
  UserStatus,
} from "../src/generated/prisma/client";
import { disconnectPrisma, prisma } from "../src/lib/prisma";

const SALT_ROUNDS = 10;

const main = async () => {

  const organization = await prisma.organization.upsert({
    where: { code: "hilite-builders" },
    update: {},
    create: {
      name: "HiLite Builders",
      code: "hilite-builders",
      description: "Sample organization for development",
      status: OrganizationStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@hilite.com" },
    update: {},
    create: {
      email: "admin@hilite.com",
      name: "Platform Admin",
      passwordHash: await bcrypt.hash("Admin@123", SALT_ROUNDS),
      role: UserRole.PLATFORM_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@hilitebuilders.com" },
    update: {},
    create: {
      email: "admin@hilitebuilders.com",
      name: "Organization Admin",
      passwordHash: await bcrypt.hash("HBuilders@123", SALT_ROUNDS),
      role: UserRole.ORG_ADMIN,
      status: UserStatus.ACTIVE,
      organizationId: organization.id,
    },
  });

  console.log("Seed completed successfully");
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma();
  });
