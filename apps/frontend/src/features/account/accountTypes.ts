export type UpdateProfilePayload = {
  name: string;
  phoneNumber?: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
