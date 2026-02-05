import { categoryRepository } from '../repositories/categoryRepository';
import { ApiError } from '../utils/ApiError';

export const categoryService = {
  list: async () => {
    return categoryRepository.findAll();
  },
  get: async (id: number) => {
    const cat = await categoryRepository.findById(id);
    if (!cat) throw new ApiError(404, 'Category not found');
    return cat;
  },
  create: async (data: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string }) => {
    return categoryRepository.create(data);
  },
  update: async (id: number, data: { name?: string; type?: 'INCOME' | 'EXPENSE'; color?: string }) => {
    await categoryService.get(id);
    return categoryRepository.update(id, data);
  },
  remove: async (id: number) => {
    await categoryService.get(id);
    return categoryRepository.delete(id);
  }
};
