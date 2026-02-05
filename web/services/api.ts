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

export async function createCategory(data: { name: string; type: 'INCOME' | 'EXPENSE' }) {
  const response = await api.post('/categories', data);
  return response.data;
}

export async function updateCategory(id: number, data: Partial<{ name: string; type: 'INCOME' | 'EXPENSE' }>) {
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
  getGoals: async () => [], // Goals not implemented in backend yet
  createGoal: async () => null,
  updateGoal: async () => null,
  deleteGoal: async () => null,
};
