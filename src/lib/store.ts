import { Friend, Expense, Balance, Settlement } from "@/types";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface AppState {
  friends: Friend[];
  expenses: Expense[];
  addFriend: (name: string, email?: string, avatarUrl?: string) => void;
  removeFriend: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;
  getBalances: () => Balance[];
  getSettlementSuggestions: () => Settlement[];
}

export const useAppStore = create<AppState>((set, get) => ({
  friends: [],
  expenses: [],

  addFriend: (name, email, avatarUrl) => {
    set((state) => ({
      friends: [
        ...state.friends,
        {
          id: uuidv4(),
          name,
          email,
          avatarUrl,
        },
      ],
    }));
  },

  removeFriend: (id) => {
    set((state) => ({
      friends: state.friends.filter((friend) => friend.id !== id),
    }));
  },

  addExpense: (expense) => {
    set((state) => ({
      expenses: [
        ...state.expenses,
        {
          ...expense,
          id: uuidv4(),
        },
      ],
    }));
  },

  removeExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
    }));
  },

  getBalances: () => {
    const { friends, expenses } = get();
    const balances: Record<string, Record<string, number>> = {};

    // Initialize balances
    friends.forEach((friend) => {
      balances[friend.id] = {};
      friends.forEach((otherFriend) => {
        if (friend.id !== otherFriend.id) {
          balances[friend.id][otherFriend.id] = 0;
        }
      });
    });

    // Calculate balances from expenses
    expenses.forEach((expense) => {
      const paidById = expense.paidById;
      
      expense.splits.forEach((split) => {
        if (split.friendId !== paidById) {
          // The person who paid is owed money by others
          balances[paidById][split.friendId] = (balances[paidById][split.friendId] || 0) + split.amount;
          // The person who owes money
          balances[split.friendId][paidById] = (balances[split.friendId][paidById] || 0) - split.amount;
        }
      });
    });

    // Simplify balances (net amounts)
    const simplifiedBalances: Balance[] = [];
    
    friends.forEach((fromFriend) => {
      friends.forEach((toFriend) => {
        if (fromFriend.id !== toFriend.id) {
          const amount = balances[fromFriend.id][toFriend.id];
          if (amount > 0) {
            simplifiedBalances.push({
              fromId: toFriend.id,
              toId: fromFriend.id,
              amount,
            });
          }
        }
      });
    });

    return simplifiedBalances;
  },

  getSettlementSuggestions: () => {
    const balances = get().getBalances();
    const { friends } = get();
    
    // Create a map of net balances for each person
    const netBalances: Record<string, number> = {};
    
    friends.forEach((friend) => {
      netBalances[friend.id] = 0;
    });
    
    balances.forEach((balance) => {
      netBalances[balance.fromId] -= balance.amount;
      netBalances[balance.toId] += balance.amount;
    });
    
    // Separate debtors and creditors
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];
    
    Object.entries(netBalances).forEach(([id, amount]) => {
      if (amount < 0) {
        debtors.push({ id, amount: -amount });
      } else if (amount > 0) {
        creditors.push({ id, amount });
      }
    });
    
    // Sort by amount (descending)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    // Generate settlement suggestions
    const settlements: Settlement[] = [];
    
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      const amount = Math.min(debtor.amount, creditor.amount);
      
      if (amount > 0) {
        settlements.push({
          fromId: debtor.id,
          toId: creditor.id,
          amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        });
      }
      
      debtor.amount -= amount;
      creditor.amount -= amount;
      
      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
    }
    
    return settlements;
  },
}));