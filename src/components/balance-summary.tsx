import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FriendAvatar } from "./friend-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function BalanceSummary() {
  const friends = useAppStore((state) => state.friends);
  const getBalances = useAppStore((state) => state.getBalances);
  
  const balances = getBalances();
  
  // Calculate net balance for each friend
  const netBalances = new Map<string, number>();
  
  friends.forEach((friend) => {
    netBalances.set(friend.id, 0);
  });
  
  balances.forEach((balance) => {
    netBalances.set(
      balance.fromId,
      (netBalances.get(balance.fromId) || 0) - balance.amount
    );
    netBalances.set(
      balance.toId,
      (netBalances.get(balance.toId) || 0) + balance.amount
    );
  });
  
  // Sort friends by net balance (descending)
  const sortedFriends = [...friends].sort((a, b) => {
    const balanceA = netBalances.get(a.id) || 0;
    const balanceB = netBalances.get(b.id) || 0;
    return balanceB - balanceA;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedFriends.map((friend) => {
          const balance = netBalances.get(friend.id) || 0;
          const isPositive = balance > 0;
          const isNegative = balance < 0;
          const isZero = balance === 0;
          
          return (
            <div key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FriendAvatar friend={friend} size="sm" />
                <span className="text-sm font-medium">{friend.name}</span>
              </div>
              
              <span
                className={`text-sm font-semibold ${
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : isNegative
                    ? "text-red-600 dark:text-red-400"
                    : ""
                }`}
              >
                {isPositive && "+"}
                {isZero ? "$0.00" : `$${Math.abs(balance).toFixed(2)}`}
              </span>
            </div>
          );
        })}
        
        {friends.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Add friends to see balance summary.
          </p>
        )}
      </CardContent>
    </Card>
  );
}