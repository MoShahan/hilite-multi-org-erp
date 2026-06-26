import { AppError } from "../utils/AppError";

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~";

export const DEFAULT_NEW_USER_PASSWORD = "Password@123";

export const PASSWORD_HELPER_TEXT = `At least ${PASSWORD_MIN_LENGTH} characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character (${PASSWORD_SPECIAL_CHARS}).`;

const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasLowercase = (value: string) => /[a-z]/.test(value);
const hasDigit = (value: string) => /\d/.test(value);
const hasSpecialChar = (value: string) =>
  [...value].some((char) => PASSWORD_SPECIAL_CHARS.includes(char));

export type PasswordValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export const validatePasswordStrength = (
  password: string,
): PasswordValidationResult => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    };
  }

  if (!hasUppercase(password)) {
    return {
      valid: false,
      message: "Password must include at least one uppercase letter",
    };
  }

  if (!hasLowercase(password)) {
    return {
      valid: false,
      message: "Password must include at least one lowercase letter",
    };
  }

  if (!hasDigit(password)) {
    return {
      valid: false,
      message: "Password must include at least one number",
    };
  }

  if (!hasSpecialChar(password)) {
    return {
      valid: false,
      message: `Password must include at least one special character (${PASSWORD_SPECIAL_CHARS})`,
    };
  }

  return { valid: true };
};

export const assertPasswordStrength = (
  password: string,
  field: string,
): void => {
  const result = validatePasswordStrength(password);

  if (!result.valid) {
    throw AppError.badRequest(result.message, [
      { field, message: result.message },
    ]);
  }
};
