import goalsRepository from '../repositories/goalsRepository';
import { ApiError } from '../utils/ApiError';

export interface GoalPayload {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  color: string;
}

export class GoalsService {
  async getAll() {
    const goals = await goalsRepository.getAll();
    return goals.map(g => this.formatGoal(g));
  }

  async getById(id: number) {
    const goal = await goalsRepository.getById(id);
    if (!goal) throw new ApiError(404, 'Goal not found');
    return this.formatGoal(goal);
  }

  async create(data: GoalPayload) {
    // Validate input
    if (!data.name || !data.name.trim()) {
      throw new ApiError(400, 'Goal name is required');
    }
    if (data.targetAmount <= 0) {
      throw new ApiError(400, 'Target amount must be greater than 0');
    }
    if (data.currentAmount < 0) {
      throw new ApiError(400, 'Current amount cannot be negative');
    }
    if (data.currentAmount > data.targetAmount) {
      throw new ApiError(400, 'Current amount cannot exceed target amount');
    }

    const goal = await goalsRepository.create({
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      deadline: data.deadline,
      color: data.color,
    });
    return this.formatGoal(goal);
  }

  async update(id: number, data: Partial<GoalPayload>) {
    const goal = await goalsRepository.getById(id);
    if (!goal) throw new ApiError(404, 'Goal not found');

    // Validate only if provided
    if (data.name !== undefined && !data.name.trim()) {
      throw new ApiError(400, 'Goal name cannot be empty');
    }
    if (data.targetAmount !== undefined && data.targetAmount <= 0) {
      throw new ApiError(400, 'Target amount must be greater than 0');
    }
    if (data.currentAmount !== undefined && data.currentAmount < 0) {
      throw new ApiError(400, 'Current amount cannot be negative');
    }

    // Validate currentAmount vs targetAmount
    const targetAmount = data.targetAmount ?? Number(goal.targetAmount);
    const currentAmount = data.currentAmount ?? Number(goal.currentAmount);
    if (currentAmount > targetAmount) {
      throw new ApiError(400, 'Current amount cannot exceed target amount');
    }

    const updated = await goalsRepository.update(id, {
      ...(data.name && { name: data.name }),
      ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
      ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
      ...(data.deadline !== undefined && { deadline: data.deadline }),
      ...(data.color && { color: data.color }),
    });
    return this.formatGoal(updated);
  }

  async delete(id: number) {
    const goal = await goalsRepository.getById(id);
    if (!goal) throw new ApiError(404, 'Goal not found');

    await goalsRepository.delete(id);
    return { success: true };
  }

  private formatGoal(goal: any) {
    return {
      id: goal.id,
      name: goal.name,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      deadline: goal.deadline ? goal.deadline.toISOString().split('T')[0] : null,
      color: goal.color,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }
}

export default new GoalsService();
