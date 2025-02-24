import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ExpenseCard } from "@/components/expense-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, Search, FilterX } from "lucide-react";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface ExpenseHistoryProps {
  onAddExpense: () => void;
}

export function ExpenseHistory({ onAddExpense }: ExpenseHistoryProps) {
  const expenses = useAppStore((state) => state.expenses);
  const friends = useAppStore((state) => state.friends);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterFriend, setFilterFriend] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  
  const categories = Array.from(
    new Set(expenses.map((e) => e.category).filter(Boolean) as string[])
  );
  
  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    
    // Friend filter
    const matchesFriend =
      filterFriend === "all" ||
      expense.paidById === filterFriend ||
      expense.splits.some((split) => split.friendId === filterFriend);
    
    return matchesSearch && matchesCategory && matchesFriend;
  });
  
  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return isAfter(parseISO(a.date), parseISO(b.date)) ? -1 : isEqual(parseISO(a.date), parseISO(b.date)) ? 0 : 1;
      case "date-asc":
        return isBefore(parseISO(a.date), parseISO(b.date)) ? -1 : isEqual(parseISO(a.date), parseISO(b.date)) ? 0 : 1;
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const hasFilters = filterCategory !== "all" || filterFriend !== "all" || searchTerm !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterFriend("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Expense History</h2>
        <Button onClick={onAddExpense} className="transition-all hover:shadow-md">
          <PlusIcon className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </div>
      
      <Card className="overflow-hidden border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterFriend} onValueChange={setFilterFriend}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All friends" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All friends</SelectItem>
                {friends.map((friend) => (
                  <SelectItem key={friend.id} value={friend.id}>
                    {friend.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="amount-desc">Highest amount</SelectItem>
                <SelectItem value="amount-asc">Lowest amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {hasFilters && (
            <div className="mt-4 flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <FilterX className="h-4 w-4 mr-1" /> Clear filters
              </Button>
              <span className="ml-2 text-sm text-muted-foreground">
                {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} found
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground mb-4">
              {expenses.length === 0
                ? "No expenses added yet"
                : "No expenses match your filters"}
            </p>
            {expenses.length === 0 && (
              <Button onClick={onAddExpense} className="transition-all hover:shadow-md">
                <PlusIcon className="h-4 w-4 mr-2" /> Add your first expense
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedExpenses.map((expense) => (
              <div key={expense.id} className="card-hover">
                <ExpenseCard expense={expense} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}