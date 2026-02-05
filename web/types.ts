
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
  budget?: number; // Meta mensal de gastos
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  type: TransactionType;
  category?: Category; // Joined data
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number; // Valor especificamente alocado para este objetivo
  deadline?: string;
  color: string;
}
