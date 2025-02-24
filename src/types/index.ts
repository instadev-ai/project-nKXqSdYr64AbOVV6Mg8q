export interface Friend {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface Split {
  friendId: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  paidById: string;
  category?: string;
  splits: Split[];
  notes?: string;
}

export interface Balance {
  fromId: string;
  toId: string;
  amount: number;
}

export interface Settlement {
  fromId: string;
  toId: string;
  amount: number;
}