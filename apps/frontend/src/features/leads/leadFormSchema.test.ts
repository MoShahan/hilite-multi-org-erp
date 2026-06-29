import { describe, expect, it } from "vitest";

import { createLeadSchema, updateLeadSchema } from "./leadFormSchema";

const validLead = {
  name: "Jane Doe",
  mobileNumber: "9876543210",
  email: "",
  source: "",
  project: "",
};

describe("createLeadSchema", () => {
  it("accepts valid lead input", () => {
    expect(createLeadSchema.safeParse(validLead).success).toBe(true);
  });

  it("requires name", () => {
    const result = createLeadSchema.safeParse({ ...validLead, name: "" });
    expect(result.success).toBe(false);
  });

  it("requires a 10-digit mobile number", () => {
    expect(createLeadSchema.safeParse({ ...validLead, mobileNumber: "123" }).success).toBe(
      false,
    );
    expect(
      createLeadSchema.safeParse({ ...validLead, mobileNumber: "12345678901" }).success,
    ).toBe(false);
  });

  it("accepts empty email or valid email", () => {
    expect(createLeadSchema.safeParse({ ...validLead, email: "" }).success).toBe(true);
    expect(
      createLeadSchema.safeParse({ ...validLead, email: "jane@example.com" }).success,
    ).toBe(true);
    expect(
      createLeadSchema.safeParse({ ...validLead, email: "not-an-email" }).success,
    ).toBe(false);
  });
});

describe("updateLeadSchema", () => {
  it("accepts valid lead input", () => {
    expect(updateLeadSchema.safeParse(validLead).success).toBe(true);
  });

  it("requires name and mobile number", () => {
    expect(updateLeadSchema.safeParse({ ...validLead, name: "" }).success).toBe(false);
    expect(updateLeadSchema.safeParse({ ...validLead, mobileNumber: "" }).success).toBe(
      false,
    );
  });
});
