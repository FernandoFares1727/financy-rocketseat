import { Request, Response, NextFunction } from 'express';
import goalsService from '../services/goalsService';

export async function getGoals(req: Request, res: Response, next: NextFunction) {
  try {
    const goals = await goalsService.getAll();
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
}

export async function getGoalById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const goal = await goalsService.getById(Number(id));
    res.status(200).json(goal);
  } catch (error) {
    next(error);
  }
}

export async function createGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, targetAmount, currentAmount, deadline, color } = req.body;

    const goal = await goalsService.create({
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      color: color || '#3b82f6',
    });

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, targetAmount, currentAmount, deadline, color } = req.body;

    const goal = await goalsService.update(Number(id), {
      ...(name && { name }),
      ...(targetAmount !== undefined && { targetAmount }),
      ...(currentAmount !== undefined && { currentAmount }),
      ...(deadline !== undefined && { deadline }),
      ...(color && { color }),
    });

    res.status(200).json(goal);
  } catch (error) {
    next(error);
  }
}

export async function deleteGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    await goalsService.delete(Number(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
