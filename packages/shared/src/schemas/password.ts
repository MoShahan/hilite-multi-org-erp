import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~";

const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasLowercase = (value: string) => /[a-z]/.test(value);
const hasDigit = (value: string) => /\d/.test(value);
const hasSpecialChar = (value: string) =>
  [...value].some((char) => PASSWORD_SPECIAL_CHARS.includes(char));

export const passwordFieldSchema = () =>
  z.string().superRefine((value, ctx) => {
    if (!value || value.length < PASSWORD_MIN_LENGTH) {
      ctx.addIssue({
        code: "custom",
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      });
      return;
    }

    if (!hasUppercase(value)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must include at least one uppercase letter",
      });
    }

    if (!hasLowercase(value)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must include at least one lowercase letter",
      });
    }

    if (!hasDigit(value)) {
      ctx.addIssue({
        code: "custom",
        message: "Password must include at least one number",
      });
    }

    if (!hasSpecialChar(value)) {
      ctx.addIssue({
        code: "custom",
        message: `Password must include at least one special character (${PASSWORD_SPECIAL_CHARS})`,
      });
    }
  });
