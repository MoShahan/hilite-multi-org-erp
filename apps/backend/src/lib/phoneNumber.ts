import { AppError } from "../utils/AppError";

const PHONE_PATTERN = /^\d{10}$/;

export const parseOptionalPhoneNumber = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();

  if (trimmed === "") {
    return null;
  }

  if (!PHONE_PATTERN.test(trimmed)) {
    throw AppError.badRequest("Phone number must be exactly 10 digits", [
      {
        field: "phoneNumber",
        message: "Phone number must be exactly 10 digits",
      },
    ]);
  }

  return trimmed;
};

export const parseRequiredPhoneNumber = (
  value: unknown,
  field = "mobileNumber",
): string => {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    throw AppError.badRequest("Mobile number is required", [
      { field, message: "Mobile number is required" },
    ]);
  }

  if (!PHONE_PATTERN.test(trimmed)) {
    throw AppError.badRequest("Mobile number must be exactly 10 digits", [
      { field, message: "Mobile number must be exactly 10 digits" },
    ]);
  }

  return trimmed;
};
