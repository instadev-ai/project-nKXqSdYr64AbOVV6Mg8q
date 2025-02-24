import { Friend } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface FriendAvatarProps {
  friend: Friend;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FriendAvatar({ friend, className, size = "md" }: FriendAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {friend.avatarUrl && <AvatarImage src={friend.avatarUrl} alt={friend.name} />}
      <AvatarFallback className="bg-primary/10 text-primary">
        {getInitials(friend.name)}
      </AvatarFallback>
    </Avatar>
  );
}