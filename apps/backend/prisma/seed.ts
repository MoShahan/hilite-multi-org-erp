import { OrganizationStatus } from "../src/generated/prisma/client";
import {
  seedDefaultRolesForOrg,
  seedPlatformRole,
} from "../src/lib/roleSeeding";
import { seedPermissions } from "../src/lib/seedPermissions";
import { disconnectPrisma, prisma } from "../src/lib/prisma";

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
