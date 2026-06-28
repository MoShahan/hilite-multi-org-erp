import { z } from "zod";

import { passwordFieldSchema } from "./password";

const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "SITE_VISIT_COMPLETED",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

const activityTypeSchema = z.enum([
  "CALL",
  "EMAIL",
  "OFFLINE_MEETING",
  "NOTE",
  "ONLINE_MEETING",
  "SITE_VISIT",
  "MESSAGE",
]);

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]).optional(),
  source: z.string().optional(),
  project: z.string().optional(),
  teamId: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
});

export const updateLeadSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    mobileNumber: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .nullable()
      .optional(),
    email: z
      .union([z.literal(""), z.email("Enter a valid email address")])
      .nullable()
      .optional(),
    source: z.string().nullable().optional(),
    project: z.string().nullable().optional(),
    status: leadStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const assignLeadSchema = z.object({
  assignedToId: z.string().nullable(),
});

export const createActivitySchema = z.object({
  type: activityTypeSchema,
  notes: z.string().min(1, "Notes are required"),
});

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: passwordFieldSchema(),
  roleId: z.string().min(1, "Role is required"),
});

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
