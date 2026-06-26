import { AppError } from "../utils/AppError";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const parseOptionalEmail = (
  value: unknown,
  field = "email",
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();

  if (trimmed === "") {
    return null;
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    throw AppError.badRequest("Enter a valid email address", [
      { field, message: "Enter a valid email address" },
    ]);
  }

  return trimmed;
};
