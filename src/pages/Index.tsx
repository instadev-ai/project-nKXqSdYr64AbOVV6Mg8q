import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddFriendDialog } from "@/components/add-friend-dialog";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { FriendsList } from "@/components/friends-list";
import { ExpenseHistory } from "@/components/expense-history";
import { BalanceSummary } from "@/components/balance-summary";
import { SettlementSuggestions } from "@/components/settlement-suggestions";
import { Button } from "@/components/ui/button";
import { PlusIcon, Receipt, Users, BarChart, CreditCard } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("expenses");
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">SplitWise</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => setAddFriendDialogOpen(true)} 
              className="transition-all hover:shadow-md">
              <Users className="h-4 w-4 mr-2" /> Add Friend
            </Button>
            <Button size="sm" onClick={() => setAddExpenseDialogOpen(true)}
              className="transition-all hover:shadow-md">
              <PlusIcon className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 rounded-lg p-1 shadow-sm">
            <TabsTrigger value="expenses" className="flex items-center gap-2 py-2 data-[state=active]:bg-primary/10">
              <Receipt className="h-4 w-4" /> Expenses
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2 py-2 data-[state=active]:bg-primary/10">
              <Users className="h-4 w-4" /> Friends
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex items-center gap-2 py-2 data-[state=active]:bg-primary/10">
              <BarChart className="h-4 w-4" /> Balances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6 animate-in fade-in-50 duration-300">
            <ExpenseHistory onAddExpense={() => setAddExpenseDialogOpen(true)} />
          </TabsContent>

          <TabsContent value="friends" className="space-y-6 animate-in fade-in-50 duration-300">
            <FriendsList onAddFriend={() => setAddFriendDialogOpen(true)} />
          </TabsContent>

          <TabsContent value="balances" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid gap-6 md:grid-cols-2">
              <BalanceSummary />
              <SettlementSuggestions />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AddFriendDialog 
        open={addFriendDialogOpen} 
        onOpenChange={setAddFriendDialogOpen} 
      />
      
      <AddExpenseDialog 
        open={addExpenseDialogOpen} 
        onOpenChange={setAddExpenseDialogOpen} 
      />
    </div>
  );
};

export default Index;