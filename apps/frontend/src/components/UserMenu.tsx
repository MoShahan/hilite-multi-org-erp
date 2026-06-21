import { ChevronsUpDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { selectAuthUser } from "@/features/auth/authSelectors";
import { logout } from "@/features/auth/authSlice";
import { formatRoleLabel } from "@/lib/format";
import { getAvatarGradient, getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";

export const UserMenu = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  if (!user) {
    return null;
  }

  const initials = getInitials(user.name);
  const gradient = getAvatarGradient(user.email);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 rounded-full py-1.5 pr-2 pl-1.5 hover:bg-muted/80"
        >
          <Avatar size="sm">
            <AvatarFallback
              className={cn(
                "bg-gradient-to-br text-xs font-semibold text-white",
                gradient,
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate text-sm font-medium sm:inline">
            {user.name}
          </span>
          <ChevronsUpDown className="hidden size-4 text-muted-foreground sm:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <Badge variant="secondary" className="w-fit text-[10px]">
              {formatRoleLabel(user.role)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleLogout()}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
