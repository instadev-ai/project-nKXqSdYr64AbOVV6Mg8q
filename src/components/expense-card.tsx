import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Friend, Expense } from "@/types";
import { FriendAvatar } from "./friend-avatar";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ExpenseCardProps {
  expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const friends = useAppStore((state) => state.friends);
  
  const paidByFriend = friends.find((f) => f.id === expense.paidById);
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Food & Drink":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Groceries":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Transportation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Housing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Entertainment":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
      case "Travel":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Utilities":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  const getFriendById = (id: string): Friend | undefined => {
    return friends.find((f) => f.id === id);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{expense.title}</CardTitle>
            <CardDescription>{formatDate(expense.date)}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">${expense.amount.toFixed(2)}</div>
            {expense.category && (
              <Badge variant="outline" className={getCategoryColor(expense.category)}>
                {expense.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 mb-3">
          <FriendAvatar friend={paidByFriend || { id: "", name: "Unknown" }} size="sm" />
          <span className="text-sm">
            <span className="font-medium">{paidByFriend?.name || "Unknown"}</span> paid
          </span>
        </div>
        
        <Separator className="my-2" />
        
        <div className="space-y-1 mt-2">
          {expense.splits.map((split) => {
            const friend = getFriendById(split.friendId);
            if (!friend) return null;
            
            return (
              <div key={split.friendId} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FriendAvatar friend={friend} size="sm" />
                  <span className="text-sm font-medium">{friend.name}</span>
                </div>
                <span className="text-sm">
                  ${split.amount.toFixed(2)}
                  {split.percentage && ` (${Math.round(split.percentage)}%)`}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
      {expense.notes && (
        <CardFooter className="pt-0">
          <p className="text-sm text-muted-foreground">{expense.notes}</p>
        </CardFooter>
      )}
    </Card>
  );
}