import { prisma } from '../prisma/client';

export const transactionRepository = {
  findAll: () => prisma.transaction.findMany({ orderBy: { date: 'desc' } }),
  findById: (id: number) => prisma.transaction.findUnique({ where: { id } }),
  create: (data: any) => prisma.transaction.create({ data }),
  update: (id: number, data: any) => prisma.transaction.update({ where: { id }, data }),
  delete: (id: number) => prisma.transaction.delete({ where: { id } })
};
