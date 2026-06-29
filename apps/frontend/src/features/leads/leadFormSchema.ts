import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  source: z.string().optional(),
  project: z.string().optional(),
  teamId: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  source: z.string().optional(),
  project: z.string().optional(),
});

export type CreateLeadFormValues = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormValues = z.infer<typeof updateLeadSchema>;
