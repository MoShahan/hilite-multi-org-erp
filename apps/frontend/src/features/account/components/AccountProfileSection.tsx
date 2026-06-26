import { useState } from "react";

import { useAppSelector } from "@/app/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { selectAuthUser } from "@/features/auth/authSelectors";
import { formatRoleLabel } from "@/lib/format";

import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { EditProfileDialog } from "./EditProfileDialog";

export const AccountProfileSection = () => {
  const user = useAppSelector(selectAuthUser);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Phone</p>
            <p className="text-sm text-muted-foreground">
              {user.phoneNumber ?? "—"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Contact your administrator to change your email.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Role</p>
            <Badge variant="secondary">{formatRoleLabel(user.role)}</Badge>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit profile
          </Button>
          <Button variant="outline" onClick={() => setPasswordOpen(true)}>
            Change password
          </Button>
        </CardFooter>
      </Card>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
};
