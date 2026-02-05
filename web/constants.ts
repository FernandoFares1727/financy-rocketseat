
import { Category, Transaction, SavingsGoal } from './types';

export const API_BASE_URL = 'http://localhost:3000';

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Salário', color: '#10b981', type: 'INCOME' },
  { id: '2', name: 'Alimentação', color: '#ef4444', type: 'EXPENSE', budget: 1200 },
  { id: '3', name: 'Transporte', color: '#3b82f6', type: 'EXPENSE', budget: 400 },
  { id: '4', name: 'Lazer', color: '#8b5cf6', type: 'EXPENSE', budget: 500 },
  { id: '5', name: 'Educação', color: '#f59e0b', type: 'EXPENSE', budget: 1000 },
  { id: '6', name: 'Freelance', color: '#06b6d4', type: 'INCOME' },
];

// Helper para gerar datas baseadas no mês atual para que o gráfico de 12 meses sempre tenha dados
const getDateRelativeToNow = (monthsAgo: number, day: number) => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
  return date.toISOString().split('T')[0];
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  // Mês Atual
  { id: 't1', description: 'Salário Mensal', amount: 5000, date: getDateRelativeToNow(0, 1), categoryId: '1', type: 'INCOME' },
  { id: 't2', description: 'Supermercado Mensal', amount: 850, date: getDateRelativeToNow(0, 5), categoryId: '2', type: 'EXPENSE' },
  { id: 't2_2', description: 'Almoço Executivo', amount: 45, date: getDateRelativeToNow(0, 7), categoryId: '2', type: 'EXPENSE' },
  { id: 't3_1', description: 'Combustível', amount: 320, date: getDateRelativeToNow(0, 10), categoryId: '3', type: 'EXPENSE' },
  
  // 1 Mês atrás
  { id: 't3', description: 'Freelance Design', amount: 2000, date: getDateRelativeToNow(1, 15), categoryId: '6', type: 'INCOME' },
  { id: 't4', description: 'Restaurante FDS', amount: 250, date: getDateRelativeToNow(1, 20), categoryId: '2', type: 'EXPENSE' },
  
  // 2 Meses atrás
  { id: 't5', description: 'Salário Mensal', amount: 5000, date: getDateRelativeToNow(2, 1), categoryId: '1', type: 'INCOME' },
  { id: 't6', description: 'Curso de Especialização', amount: 1200, date: getDateRelativeToNow(2, 10), categoryId: '5', type: 'EXPENSE' },
  
  // 4 Meses atrás
  { id: 't7', description: 'Venda de Eletrônico', amount: 800, date: getDateRelativeToNow(4, 12), categoryId: '6', type: 'INCOME' },
  { id: 't8', description: 'Manutenção Carro', amount: 600, date: getDateRelativeToNow(4, 25), categoryId: '3', type: 'EXPENSE' },
  
  // 6 Meses atrás
  { id: 't9', description: 'Salário Mensal', amount: 5000, date: getDateRelativeToNow(6, 1), categoryId: '1', type: 'INCOME' },
  { id: 't10', description: 'Viagem Curta', amount: 1500, date: getDateRelativeToNow(6, 18), categoryId: '4', type: 'EXPENSE' },
  
  // 9 Meses atrás
  { id: 't11', description: 'Bônus de Performance', amount: 3000, date: getDateRelativeToNow(9, 5), categoryId: '1', type: 'INCOME' },
  { id: 't12', description: 'Jantar Comemorativo', amount: 400, date: getDateRelativeToNow(9, 20), categoryId: '4', type: 'EXPENSE' },
  
  // 11 Meses atrás
  { id: 't13', description: 'Salário Mensal', amount: 5000, date: getDateRelativeToNow(11, 1), categoryId: '1', type: 'INCOME' },
  { id: 't14', description: 'Material Escolar', amount: 350, date: getDateRelativeToNow(11, 10), categoryId: '5', type: 'EXPENSE' },
];

export const MOCK_GOALS: SavingsGoal[] = [
  { id: 'g1', name: 'Reserva de Emergência', targetAmount: 20000, currentAmount: 5000, color: '#10b981' },
  { id: 'g2', name: 'Viagem Japão', targetAmount: 15000, currentAmount: 2000, deadline: getDateRelativeToNow(-24, 1), color: '#ef4444' },
  { id: 'g3', name: 'Troca de Carro', targetAmount: 45000, currentAmount: 0, color: '#3b82f6' },
];
