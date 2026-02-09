import { prisma } from '../prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const categoryRepository = {
  findAll: () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
  findById: (id: number) => prisma.category.findUnique({ where: { id } }),
  create: (data: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string; budget?: number }) => {
    const processedData = {
      ...data,
      ...(data.budget !== undefined && { budget: new Decimal(data.budget) })
    };
    return prisma.category.create({ data: processedData });
  },
  update: (id: number, data: { name?: string; type?: 'INCOME' | 'EXPENSE'; color?: string; budget?: number }) => {
    const processedData = {
      ...data,
      ...(data.budget !== undefined && { budget: new Decimal(data.budget) })
    };
    return prisma.category.update({ where: { id }, data: processedData });
  },
  delete: (id: number) => prisma.category.delete({ where: { id } })
};
