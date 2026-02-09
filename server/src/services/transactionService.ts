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
  create: async (data: { title: string; amount: number; categoryId: number; date?: string; type: 'INCOME' | 'EXPENSE' }) => {
    if (data.amount <= 0) throw new ApiError(400, 'Amount must be greater than zero');

    const category = await categoryRepository.findById(data.categoryId);
    if (!category) throw new ApiError(400, 'Category not found');

    // Ensure provided type matches category type
    if (data.type !== category.type) throw new ApiError(400, 'Transaction type does not match category type');

    const parsedDate = data.date ? new Date(data.date) : undefined;

    const transactionData = {
      title: data.title,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      date: parsedDate
    };
    
    const result = await transactionRepository.create(transactionData);
    return result;
  },
  update: async (id: number, data: any) => {
    const existing = await transactionService.get(id);
    if (data.amount !== undefined && data.amount <= 0) throw new ApiError(400, 'Amount must be greater than zero');

    // If categoryId or type provided, validate compatibility
    const newCategoryId = data.categoryId !== undefined ? data.categoryId : existing.categoryId;
    const category = await categoryRepository.findById(newCategoryId);
    if (!category) throw new ApiError(400, 'Category not found');

    const newType = data.type !== undefined ? data.type : (existing as any).type;
    if (newType !== category.type) throw new ApiError(400, 'Transaction type does not match category type');

    return transactionRepository.update(id, { ...data, type: newType, date: data.date ? new Date(data.date) : undefined });
  },
  remove: async (id: number) => {
    await transactionService.get(id);
    return transactionRepository.delete(id);
  }
};
