import { z } from "zod";

import { passwordFieldSchema } from "./password";

export const createPlatformUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: passwordFieldSchema(),
});

export const updatePlatformUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CreatePlatformUserInput = z.infer<typeof createPlatformUserSchema>;
export type UpdatePlatformUserStatusInput = z.infer<
  typeof updatePlatformUserStatusSchema
>;
