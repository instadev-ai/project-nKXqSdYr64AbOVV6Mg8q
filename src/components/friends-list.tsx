import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FriendAvatar } from "@/components/friend-avatar";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface FriendsListProps {
  onAddFriend: () => void;
}

export function FriendsList({ onAddFriend }: FriendsListProps) {
  const friends = useAppStore((state) => state.friends);
  const removeFriend = useAppStore((state) => state.removeFriend);
  const [friendToDelete, setFriendToDelete] = useState<string | null>(null);

  const handleDeleteFriend = () => {
    if (friendToDelete) {
      const friend = friends.find((f) => f.id === friendToDelete);
      removeFriend(friendToDelete);
      toast.success(`${friend?.name || "Friend"} removed`);
      setFriendToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Friends</h2>
        <Button size="sm" onClick={onAddFriend}>
          <PlusIcon className="h-4 w-4 mr-1" /> Add Friend
        </Button>
      </div>
      
      <div className="space-y-2">
        {friends.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No friends added yet</p>
            <Button onClick={onAddFriend}>Add your first friend</Button>
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <FriendAvatar friend={friend} />
                <div>
                  <p className="font-medium">{friend.name}</p>
                  {friend.email && (
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFriendToDelete(friend.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))
        )}
      </div>
      
      <AlertDialog open={!!friendToDelete} onOpenChange={(open) => !open && setFriendToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this friend and their expense history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFriend} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}