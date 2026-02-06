import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Categories =====
export async function getCategories() {
  const response = await api.get('/categories');
  return response.data;
}

export async function getCategoryById(id: number) {
  const response = await api.get(`/categories/${id}`);
  return response.data;
}

export async function createCategory(data: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string; budget?: number }) {
  const response = await api.post('/categories', data);
  return response.data;
}

export async function updateCategory(id: number, data: Partial<{ name: string; type: 'INCOME' | 'EXPENSE'; color: string; budget: number }>) {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`);
}

// ===== Transactions =====
export async function getTransactions() {
  const response = await api.get('/transactions');
  return response.data;
}

export async function getTransactionById(id: number) {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
}

export async function createTransaction(data: {
  title: string;
  amount: number;
  categoryId: number;
  date?: string;
}) {
  const response = await api.post('/transactions', data);
  return response.data;
}

export async function updateTransaction(
  id: number,
  data: Partial<{ title: string; amount: number; categoryId: number; date: string }>
) {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
}

export async function deleteTransaction(id: number) {
  await api.delete(`/transactions/${id}`);
}

// ===== Goals =====
export async function getGoals() {
  const response = await api.get('/goals');
  return response.data;
}

export async function getGoalById(id: number) {
  const response = await api.get(`/goals/${id}`);
  return response.data;
}

export async function createGoal(data: {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}) {
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
) {
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

