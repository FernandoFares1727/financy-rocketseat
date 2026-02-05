import { prisma } from '../prisma/client';

export const categoryRepository = {
  findAll: () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
  findById: (id: number) => prisma.category.findUnique({ where: { id } }),
  create: (data: { name: string; type: 'INCOME' | 'EXPENSE' }) =>
    prisma.category.create({ data }),
  update: (id: number, data: { name?: string; type?: 'INCOME' | 'EXPENSE' }) =>
    prisma.category.update({ where: { id }, data }),
  delete: (id: number) => prisma.category.delete({ where: { id } })
};
