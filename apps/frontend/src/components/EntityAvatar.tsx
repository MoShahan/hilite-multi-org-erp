import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarGradient, getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";

type EntityAvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
};

export const EntityAvatar = ({
  name,
  imageUrl,
  size = "default",
  className,
}: EntityAvatarProps) => {
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);

  return (
    <Avatar size={size} className={className}>
      {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br font-semibold text-white",
          gradient,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
