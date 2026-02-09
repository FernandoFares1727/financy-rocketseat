import { prisma } from '../prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const transactionRepository = {
  findAll: () => prisma.transaction.findMany({ orderBy: { date: 'desc' } }),
  findById: (id: number) => prisma.transaction.findUnique({ where: { id } }),
  create: (data: { title: string; type: 'INCOME' | 'EXPENSE'; amount: number; categoryId: number; date?: Date }) => {
    const processedData = {
      ...data,
      amount: new Decimal(data.amount)
    };
    return prisma.transaction.create({ data: processedData });
  },
  update: (id: number, data: { title?: string; type?: 'INCOME' | 'EXPENSE'; amount?: number; categoryId?: number; date?: Date }) => {
    const processedData = {
      ...data,
      ...(data.amount !== undefined && { amount: new Decimal(data.amount) })
    };
    return prisma.transaction.update({ where: { id }, data: processedData });
  },
  delete: (id: number) => prisma.transaction.delete({ where: { id } })
};
