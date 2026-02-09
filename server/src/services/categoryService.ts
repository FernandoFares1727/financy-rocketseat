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
  create: async (data: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string; budget?: number }) => {
    try {
      return await categoryRepository.create(data);
    } catch (error: any) {
      // Prisma unique constraint error code
      if (error && (error.code === 'P2002' || error.meta?.target?.includes('name'))) {
        throw new ApiError(409, 'Category name already in use');
      }
      throw error;
    }
  },
  update: async (id: number, data: { name?: string; type?: 'INCOME' | 'EXPENSE'; color?: string; budget?: number }) => {
    await categoryService.get(id);
    try {
      return await categoryRepository.update(id, data);
    } catch (error: any) {
      if (error && (error.code === 'P2002' || error.meta?.target?.includes('name'))) {
        throw new ApiError(409, 'Category name already in use');
      }
      throw error;
    }
  },
  remove: async (id: number) => {
    await categoryService.get(id);
    return categoryRepository.delete(id);
  }
};
