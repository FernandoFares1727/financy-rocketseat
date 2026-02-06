import { prisma } from '../prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class GoalsRepository {
  async getAll() {
    return await prisma.savingsGoal.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: number) {
    return await prisma.savingsGoal.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string | null;
    color: string;
  }) {
    return await prisma.savingsGoal.create({
      data: {
        name: data.name,
        targetAmount: new Decimal(data.targetAmount),
        currentAmount: new Decimal(data.currentAmount),
        deadline: data.deadline ? new Date(data.deadline) : null,
        color: data.color,
      },
    });
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      targetAmount: number;
      currentAmount: number;
      deadline?: string | null;
      color: string;
    }>
  ) {
    return await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.targetAmount !== undefined && {
          targetAmount: new Decimal(data.targetAmount),
        }),
        ...(data.currentAmount !== undefined && {
          currentAmount: new Decimal(data.currentAmount),
        }),
        ...(data.deadline !== undefined && {
          deadline: data.deadline ? new Date(data.deadline) : null,
        }),
        ...(data.color && { color: data.color }),
      },
    });
  }

  async delete(id: number) {
    return await prisma.savingsGoal.delete({
      where: { id },
    });
  }
}

export default new GoalsRepository();
