import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Backend DTO types
export interface BackendCategory {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
  budget?: number | string | null;
}

export interface BackendTransaction {
  id: number;
  title: string;
  amount: number | string;
  date: string;
  categoryId: number;
  type: 'INCOME' | 'EXPENSE';
}

export interface BackendGoal {
  id: number;
  name: string;
  targetAmount: number | string;
  currentAmount: number | string;
  deadline?: string | null;
  color: string;
}

// ===== Categories =====
export async function getCategories(): Promise<BackendCategory[]> {
  const response = await api.get('/categories');
  return response.data;
}

export async function getCategoryById(id: number): Promise<BackendCategory> {
  const response = await api.get(`/categories/${id}`);
  return response.data;
}

export async function createCategory(data: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string; budget?: number }): Promise<BackendCategory> {
  const response = await api.post('/categories', data);
  return response.data;
}

export async function updateCategory(id: number, data: Partial<{ name: string; type: 'INCOME' | 'EXPENSE'; color: string; budget: number }>): Promise<BackendCategory> {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`);
}

// ===== Transactions =====
export async function getTransactions(): Promise<BackendTransaction[]> {
  const response = await api.get('/transactions');
  return response.data;
}

export async function getTransactionById(id: number): Promise<BackendTransaction> {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
}

export async function createTransaction(data: {
  title: string;
  amount: number;
  categoryId: number;
  date?: string;
  type: 'INCOME' | 'EXPENSE';
}): Promise<BackendTransaction> {
  const response = await api.post('/transactions', data);
  return response.data;
}

export async function updateTransaction(
  id: number,
  data: Partial<{ title: string; amount: number; categoryId: number; date: string; type: 'INCOME' | 'EXPENSE' }>
): Promise<BackendTransaction> {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
}

export async function deleteTransaction(id: number) {
  await api.delete(`/transactions/${id}`);
}

// ===== Goals =====
export async function getGoals(): Promise<BackendGoal[]> {
  const response = await api.get('/goals');
  return response.data;
}

export async function getGoalById(id: number): Promise<BackendGoal> {
  const response = await api.get(`/goals/${id}`);
  return response.data;
}

export async function createGoal(data: {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}): Promise<BackendGoal> {
  const response = await api.post('/goals', data);
  return response.data;
}

export async function updateGoal(
  id: number,
  data: Partial<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    color: string;
  }>
): Promise<BackendGoal> {
  const response = await api.put(`/goals/${id}`, data);
  return response.data;
}

export async function deleteGoal(id: number) {
  await api.delete(`/goals/${id}`);
}

// Exported as service object for compatibility with existing code
export const financeService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
};

