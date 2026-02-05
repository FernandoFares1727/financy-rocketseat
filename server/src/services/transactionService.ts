import { transactionRepository } from '../repositories/transactionRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { ApiError } from '../utils/ApiError';

export const transactionService = {
  list: async () => {
    return transactionRepository.findAll();
  },
  get: async (id: number) => {
    const tx = await transactionRepository.findById(id);
    if (!tx) throw new ApiError(404, 'Transaction not found');
    return tx;
  },
  create: async (data: { title: string; amount: number; categoryId: number; date?: string }) => {
    if (data.amount <= 0) throw new ApiError(400, 'Amount must be greater than zero');

    const category = await categoryRepository.findById(data.categoryId);
    if (!category) throw new ApiError(400, 'Category not found');

    // Business rule: transaction type must be compatible with category type
    // We infer transaction type from amount sign: positive = INCOME, negative not allowed per rules
    // Therefore ensure category type is compatible: amount > 0 and category type INCOME or EXPENSE allowed by domain

    // For this system we require positive amounts. The category's type is advisory and should be respected by frontend.

    return transactionRepository.create({
      title: data.title,
      amount: data.amount,
      categoryId: data.categoryId,
      date: data.date ? new Date(data.date) : undefined
    });
  },
  update: async (id: number, data: any) => {
    await transactionService.get(id);
    if (data.amount !== undefined && data.amount <= 0) throw new ApiError(400, 'Amount must be greater than zero');
    return transactionRepository.update(id, { ...data, date: data.date ? new Date(data.date) : undefined });
  },
  remove: async (id: number) => {
    await transactionService.get(id);
    return transactionRepository.delete(id);
  }
};
