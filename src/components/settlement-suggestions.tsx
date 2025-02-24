import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FriendAvatar } from "./friend-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function SettlementSuggestions() {
  const friends = useAppStore((state) => state.friends);
  const getSettlementSuggestions = useAppStore((state) => state.getSettlementSuggestions);
  
  const settlements = getSettlementSuggestions();
  
  const getFriendById = (id: string) => {
    return friends.find((f) => f.id === id);
  };

  if (settlements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settlement Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No settlements needed. Everyone is square!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Settlement Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {settlements.map((settlement, index) => {
          const fromFriend = getFriendById(settlement.fromId);
          const toFriend = getFriendById(settlement.toId);
          
          if (!fromFriend || !toFriend) return null;
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FriendAvatar friend={fromFriend} size="sm" />
                <span className="text-sm font-medium">{fromFriend.name}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">${settlement.amount.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{toFriend.name}</span>
                <FriendAvatar friend={toFriend} size="sm" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}