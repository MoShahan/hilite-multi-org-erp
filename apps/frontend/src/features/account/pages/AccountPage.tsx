import { User } from "lucide-react";

import { AccountProfileSection } from "../components/AccountProfileSection";

export const AccountPage = () => {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <User className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Account settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and security.
          </p>
        </div>
      </div>

      <AccountProfileSection />
    </div>
  );
};
