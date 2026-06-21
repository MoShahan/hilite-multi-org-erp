import { prisma } from "../lib/prisma";

export const userRepository = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
  },

  findById: (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
  },
};
