
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Category, FinancialSummary, SavingsGoal } from '../types';
import { financeService, BackendTransaction, BackendCategory, BackendGoal } from '../services/api';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  goals: SavingsGoal[];
  summary: FinancialSummary;
  loading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'> & Partial<Pick<Transaction,'type'>>) => Promise<void>;
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
function mapCategory(cat: BackendCategory): Category {
  return {
    id: String(cat.id),
    name: cat.name,
    type: cat.type,
    color: cat.color || '#6366f1',
    budget: cat.budget ? Number(cat.budget) : undefined,
  };
}

/**
 * Map backend goal to frontend format
 */
function mapGoal(goal: BackendGoal): SavingsGoal {
  return {
    id: String(goal.id),
    name: goal.name,
    targetAmount: Number(goal.targetAmount),
    currentAmount: Number(goal.currentAmount),
    deadline: goal.deadline || undefined,
    color: goal.color,
  };
}

/**
 * Map backend transaction to frontend format
 */
function mapTransaction(tx: BackendTransaction, categoryMap: Map<string, Category>): Transaction {
  const cat = categoryMap.get(String(tx.categoryId));
  
  // Parse date safely - handle invalid dates
  let dateOnly: string;
  try {
    if (tx.date) {
      // If it's already in YYYY-MM-DD format, use as-is
      if (typeof tx.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(tx.date)) {
        dateOnly = tx.date.split('T')[0];
      } else {
        const parsedDate = new Date(tx.date);
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date');
        }
        dateOnly = parsedDate.toISOString().split('T')[0];
      }
    } else {
      dateOnly = new Date().toISOString().split('T')[0];
    }
  } catch (err) {
    dateOnly = new Date().toISOString().split('T')[0];
  }
  
  return {
    id: String(tx.id),
    description: tx.title, // Backend uses "title", frontend uses "description"
    amount: Number(tx.amount),
    date: dateOnly,
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
      setGoals(goalData.map(mapGoal));
    } catch (error: any) {
      // If cannot reach server, notify user and allow retry instead of redirect
      const e: any = error;
      if (e && (e.isAxiosError === true) && !e.response) {
        // Non-fatal: show user message and let UI retry
        // eslint-disable-next-line no-alert
        alert('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTransactions, setCategories, setGoals]);

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
    // Validate categoryId before proceeding
    const categoryIdNum = Number(t.categoryId);
    if (!t.categoryId || isNaN(categoryIdNum) || categoryIdNum <= 0) {
      throw new Error('Category is required');
    }

    // Optimistic UI: add temporary transaction to improve perceived UX
    const tempId = `temp-${Date.now()}`;
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const optimistic: Transaction = {
      id: tempId,
      description: t.description,
      amount: t.amount,
      date: t.date,
      categoryId: t.categoryId,
      type: categoryMap.get(t.categoryId)?.type || 'EXPENSE',
      category: categoryMap.get(t.categoryId)
    };

    setTransactions(prev => [optimistic, ...prev]);

    try {
      // normalize date to UTC midnight to avoid timezone shifts
      const payloadDate = t.date ? `${t.date}T00:00:00Z` : undefined;
      const categoryType = categoryMap.get(t.categoryId)?.type || 'EXPENSE';
      const newTx = await financeService.createTransaction({
        title: t.description,
        amount: t.amount,
        categoryId: categoryIdNum,
        date: payloadDate,
        type: categoryType,
      });

      const mappedTx = mapTransaction(newTx, categoryMap);
      // replace optimistic with real one
      setTransactions(prev => prev.map(item => item.id === tempId ? mappedTx : item));
    } catch (err) {
      // remove optimistic and inform user
      setTransactions(prev => prev.filter(item => item.id !== tempId));
      // eslint-disable-next-line no-alert
      alert('Falha ao criar transação. Tente novamente.');
      throw err;
    }
  };

  const editTransaction = async (id: string, t: Partial<Transaction>) => {
    const numId = Number(id);
    // normalize date to UTC midnight
    const payloadDate = t.date ? `${t.date}T00:00:00Z` : undefined;
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const categoryType = t.categoryId ? categoryMap.get(t.categoryId)?.type : undefined;
    const updated = await financeService.updateTransaction(numId, {
      title: t.description, // Convert description → title for backend
      amount: t.amount,
      categoryId: t.categoryId ? Number(t.categoryId) : undefined,
      date: payloadDate,
      type: categoryType as any,
    });

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
      color: c.color,
      budget: c.budget,
    });
    const mapped = mapCategory(newCat);
    setCategories(prev => [...prev, mapped]);
  };

  const editCategory = async (id: string, c: Partial<Category>) => {
    const numId = Number(id);
    const updated = await financeService.updateCategory(numId, {
      name: c.name,
      type: c.type,
      color: c.color,
      budget: c.budget,
    });
    const mapped = mapCategory(updated);
    setCategories(prev => prev.map(item => (item.id === id ? mapped : item)));

    // Update transactions that use this category: only replace the `category` field
    setTransactions(prev => prev.map(t => (t.categoryId === mapped.id ? { ...t, category: mapped } : t)));
  };

  const removeCategory = async (id: string) => {
    const numId = Number(id);
    await financeService.deleteCategory(numId);
    setCategories(prev => prev.filter(c => c.id !== id));
    // Remove all transactions associated with this category (due to cascade delete)
    setTransactions(prev => prev.filter(t => t.categoryId !== id));
  };

  const addGoal = async (g: Omit<SavingsGoal, 'id'>) => {
    const newGoal = await financeService.createGoal({
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline,
      color: g.color,
    });
    const mapped = mapGoal(newGoal);
    setGoals(prev => [...prev, mapped]);
  };

  const editGoal = async (id: string, g: Partial<SavingsGoal>) => {
    const numId = Number(id);
    const updated = await financeService.updateGoal(numId, {
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline,
      color: g.color,
    });
    const mapped = mapGoal(updated);
    setGoals(prev => prev.map(item => (item.id === id ? mapped : item)));
  };

  const removeGoal = async (id: string) => {
    const numId = Number(id);
    await financeService.deleteGoal(numId);
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
