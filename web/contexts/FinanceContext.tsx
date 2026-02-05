
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Category, FinancialSummary, SavingsGoal } from '../types';
import { financeService } from '../services/api';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  goals: SavingsGoal[];
  summary: FinancialSummary;
  loading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  editCategory: (id: string, c: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addGoal: (g: Omit<SavingsGoal, 'id'>) => Promise<void>;
  editGoal: (id: string, g: Partial<SavingsGoal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

/**
 * Map backend category to frontend format
 */
function mapCategory(cat: any): Category {
  return {
    id: String(cat.id),
    name: cat.name,
    type: cat.type,
    // Frontend expects color and budget, but backend doesn't provide them
    color: '#6366f1', // Default color
    budget: undefined,
  };
}

/**
 * Map backend transaction to frontend format
 */
function mapTransaction(tx: any, categoryMap: Map<string, Category>): Transaction {
  const cat = categoryMap.get(String(tx.categoryId));
  return {
    id: String(tx.id),
    description: tx.title, // Backend uses "title", frontend uses "description"
    amount: Number(tx.amount),
    date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    categoryId: String(tx.categoryId),
    type: cat?.type || 'EXPENSE',
    category: cat,
  };
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [transData, catData, goalData] = await Promise.all([
        financeService.getTransactions(),
        financeService.getCategories(),
        financeService.getGoals(),
      ]);

      // Map categories
      const mappedCategories = catData.map(mapCategory);
      const categoryMap = new Map(mappedCategories.map(c => [c.id, c]));

      // Map transactions with category data
      const mappedTransactions = transData.map((t: any) => mapTransaction(t, categoryMap));

      setTransactions(mappedTransactions);
      setCategories(mappedCategories);
      setGoals(goalData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const summary = React.useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
    };
  }, [transactions]);

  // CRUD Helpers
  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const newTx = await financeService.createTransaction({
      title: t.description, // Convert description → title for backend
      amount: t.amount,
      categoryId: Number(t.categoryId),
      date: t.date,
    });

    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const mappedTx = mapTransaction(newTx, categoryMap);
    setTransactions(prev => [mappedTx, ...prev]);
  };

  const editTransaction = async (id: string, t: Partial<Transaction>) => {
    const numId = Number(id);
    const updated = await financeService.updateTransaction(numId, {
      title: t.description, // Convert description → title for backend
      amount: t.amount,
      categoryId: t.categoryId ? Number(t.categoryId) : undefined,
      date: t.date,
    });

    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const mappedTx = mapTransaction(updated, categoryMap);
    setTransactions(prev =>
      prev.map(item => (item.id === id ? mappedTx : item))
    );
  };

  const removeTransaction = async (id: string) => {
    await financeService.deleteTransaction(Number(id));
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = async (c: Omit<Category, 'id'>) => {
    const newCat = await financeService.createCategory({
      name: c.name,
      type: c.type,
    });
    const mapped = mapCategory(newCat);
    setCategories(prev => [...prev, mapped]);
  };

  const editCategory = async (id: string, c: Partial<Category>) => {
    const numId = Number(id);
    const updated = await financeService.updateCategory(numId, {
      name: c.name,
      type: c.type,
    });
    const mapped = mapCategory(updated);

    setCategories(prev =>
      prev.map(item => (item.id === id ? mapped : item))
    );

    // Update transactions that use this category
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    categoryMap.set(mapped.id, mapped);

    setTransactions(prev =>
      prev.map(t =>
        t.categoryId === id ? { ...t, ...mapTransaction({ ...t, categoryId: Number(id) }, categoryMap) } : t
      )
    );
  };

  const removeCategory = async (id: string) => {
    const numId = Number(id);
    await financeService.deleteCategory(numId);
    setCategories(prev => prev.filter(c => c.id !== id));
    setTransactions(prev =>
      prev.map(t => (t.categoryId === id ? { ...t, category: undefined } : t))
    );
  };

  const addGoal = async (g: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = { ...g, id: Math.random().toString(36).substr(2, 9) };
    setGoals(prev => [...prev, newGoal]);
  };

  const editGoal = async (id: string, g: Partial<SavingsGoal>) => {
    setGoals(prev =>
      prev.map(item => (item.id === id ? { ...item, ...g } : item))
    );
  };

  const removeGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      categories,
      goals,
      summary,
      loading,
      refreshData,
      addTransaction,
      editTransaction,
      removeTransaction,
      addCategory,
      editCategory,
      removeCategory,
      addGoal,
      editGoal,
      removeGoal
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
};
