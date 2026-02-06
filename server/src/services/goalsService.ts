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
    if (!goal) throw new ApiError('Goal not found', 404);
    return this.formatGoal(goal);
  }

  async create(data: GoalPayload) {
    // Validate input
    if (!data.name || !data.name.trim()) {
      throw new ApiError('Goal name is required', 400);
    }
    if (data.targetAmount <= 0) {
      throw new ApiError('Target amount must be greater than 0', 400);
    }
    if (data.currentAmount < 0) {
      throw new ApiError('Current amount cannot be negative', 400);
    }
    if (data.currentAmount > data.targetAmount) {
      throw new ApiError('Current amount cannot exceed target amount', 400);
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
    if (!goal) throw new ApiError('Goal not found', 404);

    // Validate only if provided
    if (data.name !== undefined && !data.name.trim()) {
      throw new ApiError('Goal name cannot be empty', 400);
    }
    if (data.targetAmount !== undefined && data.targetAmount <= 0) {
      throw new ApiError('Target amount must be greater than 0', 400);
    }
    if (data.currentAmount !== undefined && data.currentAmount < 0) {
      throw new ApiError('Current amount cannot be negative', 400);
    }

    // Validate currentAmount vs targetAmount
    const targetAmount = data.targetAmount ?? Number(goal.targetAmount);
    const currentAmount = data.currentAmount ?? Number(goal.currentAmount);
    if (currentAmount > targetAmount) {
      throw new ApiError('Current amount cannot exceed target amount', 400);
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
    if (!goal) throw new ApiError('Goal not found', 404);

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
