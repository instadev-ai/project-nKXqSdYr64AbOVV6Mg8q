import { useState, useEffect } from "react";
import { Expense, Friend, Split } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { FriendAvatar } from "./friend-avatar";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SPLIT_TYPES = {
  EQUAL: "equal",
  PERCENTAGE: "percentage",
  EXACT: "exact",
};

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const friends = useAppStore((state) => state.friends);
  const addExpense = useAppStore((state) => state.addExpense);
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [paidById, setPaidById] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [splitType, setSplitType] = useState(SPLIT_TYPES.EQUAL);
  const [splits, setSplits] = useState<Split[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setAmount("");
      setDate(new Date());
      setPaidById(friends.length > 0 ? friends[0].id : "");
      setCategory("");
      setNotes("");
      setSplitType(SPLIT_TYPES.EQUAL);
      setSelectedFriends(friends.map(f => f.id));
      
      // Initialize splits with equal distribution
      if (friends.length > 0) {
        const equalAmount = 0;
        setSplits(
          friends.map((friend) => ({
            friendId: friend.id,
            amount: equalAmount,
            percentage: 100 / friends.length,
          }))
        );
      }
    }
  }, [open, friends]);

  // Recalculate splits when amount, splitType, or selectedFriends change
  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) return;
    
    const totalAmount = parseFloat(amount);
    const includedFriends = friends.filter(f => selectedFriends.includes(f.id));
    
    if (includedFriends.length === 0) return;
    
    if (splitType === SPLIT_TYPES.EQUAL) {
      const equalAmount = totalAmount / includedFriends.length;
      setSplits(
        friends.map((friend) => ({
          friendId: friend.id,
          amount: selectedFriends.includes(friend.id) ? equalAmount : 0,
          percentage: selectedFriends.includes(friend.id) ? 100 / includedFriends.length : 0,
        }))
      );
    } else if (splitType === SPLIT_TYPES.PERCENTAGE) {
      // Keep percentages but update amounts
      setSplits(
        splits.map((split) => ({
          ...split,
          amount: selectedFriends.includes(split.friendId) 
            ? (totalAmount * (split.percentage || 0)) / 100 
            : 0,
          percentage: selectedFriends.includes(split.friendId) 
            ? split.percentage 
            : 0,
        }))
      );
    }
  }, [amount, splitType, selectedFriends, friends]);

  const handleSplitChange = (friendId: string, value: string, field: "amount" | "percentage") => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) return;
    
    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount)) return;
    
    setSplits((prevSplits) => {
      const newSplits = [...prevSplits];
      const splitIndex = newSplits.findIndex((s) => s.friendId === friendId);
      
      if (splitIndex === -1) return prevSplits;
      
      if (field === "amount") {
        newSplits[splitIndex].amount = numValue;
        // Update percentage based on new amount
        newSplits[splitIndex].percentage = (numValue / totalAmount) * 100;
      } else {
        newSplits[splitIndex].percentage = numValue;
        // Update amount based on new percentage
        newSplits[splitIndex].amount = (totalAmount * numValue) / 100;
      }
      
      return newSplits;
    });
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!paidById) {
      toast.error("Please select who paid");
      return;
    }
    
    // Validate splits
    const totalSplitAmount = splits
      .filter(s => selectedFriends.includes(s.friendId))
      .reduce((sum, split) => sum + split.amount, 0);
    
    const totalAmount = parseFloat(amount);
    
    // Allow for small floating point differences
    if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
      toast.error("The split amounts must equal the total amount");
      return;
    }
    
    // Create expense object
    const expense: Omit<Expense, "id"> = {
      title,
      amount: totalAmount,
      date: format(date, "yyyy-MM-dd"),
      paidById,
      category: category || undefined,
      notes: notes || undefined,
      splits: splits.filter(s => selectedFriends.includes(s.friendId)),
    };
    
    addExpense(expense);
    toast.success("Expense added successfully");
    
    // Close dialog
    onOpenChange(false);
  };

  const categories = [
    "Food & Drink",
    "Groceries",
    "Transportation",
    "Housing",
    "Entertainment",
    "Travel",
    "Utilities",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add an expense</DialogTitle>
            <DialogDescription>
              Enter the details of your expense to split with friends.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dinner at Restaurant"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="paidBy">Paid by</Label>
              <Select value={paidById} onValueChange={setPaidById}>
                <SelectTrigger id="paidBy">
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {friends.map((friend) => (
                    <SelectItem key={friend.id} value={friend.id}>
                      <div className="flex items-center">
                        <FriendAvatar friend={friend} size="sm" className="mr-2" />
                        {friend.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Split type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={splitType === SPLIT_TYPES.EQUAL ? "default" : "outline"}
                  onClick={() => setSplitType(SPLIT_TYPES.EQUAL)}
                  className="flex-1"
                >
                  Equal
                </Button>
                <Button
                  type="button"
                  variant={splitType === SPLIT_TYPES.PERCENTAGE ? "default" : "outline"}
                  onClick={() => setSplitType(SPLIT_TYPES.PERCENTAGE)}
                  className="flex-1"
                >
                  Percentage
                </Button>
                <Button
                  type="button"
                  variant={splitType === SPLIT_TYPES.EXACT ? "default" : "outline"}
                  onClick={() => setSplitType(SPLIT_TYPES.EXACT)}
                  className="flex-1"
                >
                  Exact
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Split with</Label>
              <div className="grid gap-3 max-h-[200px] overflow-y-auto p-1">
                {friends.map((friend) => {
                  const split = splits.find((s) => s.friendId === friend.id);
                  const isSelected = selectedFriends.includes(friend.id);
                  
                  return (
                    <div key={friend.id} className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => toggleFriendSelection(friend.id)}
                      >
                        {isSelected ? "✓" : "+"}
                      </Button>
                      
                      <FriendAvatar friend={friend} size="sm" />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{friend.name}</p>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          {splitType === SPLIT_TYPES.EQUAL ? (
                            <div className="text-sm">
                              {amount && !isNaN(parseFloat(amount))
                                ? `$${(parseFloat(amount) / selectedFriends.length).toFixed(2)}`
                                : "$0.00"}
                            </div>
                          ) : splitType === SPLIT_TYPES.PERCENTAGE ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                className="w-16 h-8 text-sm"
                                value={split?.percentage?.toString() || "0"}
                                onChange={(e) => handleSplitChange(friend.id, e.target.value, "percentage")}
                              />
                              <span className="text-sm">%</span>
                            </div>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-20 h-8 text-sm"
                              value={split?.amount?.toString() || "0"}
                              onChange={(e) => handleSplitChange(friend.id, e.target.value, "amount")}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional details..."
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}