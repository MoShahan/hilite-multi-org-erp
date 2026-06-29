import bcrypt from "bcrypt";
import { OrganizationStatus, UserStatus } from "../src/generated/prisma/client";
import {
  assignPlatformRoleBySlug,
  seedDefaultRolesForOrg,
  seedPlatformRole,
} from "../src/lib/roleSeeding";
import { assignOrgMembershipBySlug } from "../src/lib/orgMembership";
import { seedDefaultModulesForOrg } from "../src/lib/seedOrganizationModules";
import { seedPermissions } from "../src/lib/seedPermissions";
import { disconnectPrisma, prisma } from "../src/lib/prisma";

const SALT_ROUNDS = 10;

const main = async () => {
  await prisma.$transaction(async (tx) => {
    await seedPermissions(tx);
    await seedPlatformRole(tx);

    const organization = await tx.organization.upsert({
      where: { code: "hilite-builders" },
      update: {},
      create: {
        name: "HiLite Builders",
        code: "hilite-builders",
        description: "Sample organization for development",
        status: OrganizationStatus.ACTIVE,
      },
    });

    await seedDefaultRolesForOrg(tx, organization.id);
    await seedDefaultModulesForOrg(tx, organization.id);

    const platformAdmin = await tx.user.upsert({
      where: { email: "admin@hilite.com" },
      update: {},
      create: {
        email: "admin@hilite.com",
        name: "Platform Admin",
        passwordHash: await bcrypt.hash("Admin@123", SALT_ROUNDS),
        status: UserStatus.ACTIVE,
      },
    });

    await assignPlatformRoleBySlug(tx, platformAdmin.id, "platform_admin");

    const orgAdmin = await tx.user.upsert({
      where: { email: "admin@hilitebuilders.com" },
      update: {},
      create: {
        email: "admin@hilitebuilders.com",
        name: "Organization Admin",
        passwordHash: await bcrypt.hash("HBuilders@123", SALT_ROUNDS),
        status: UserStatus.ACTIVE,
      },
    });

    await assignOrgMembershipBySlug(
      tx,
      orgAdmin.id,
      organization.id,
      "org_admin",
    );
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
