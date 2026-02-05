import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transactionService';
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transactionSchemas';

export const transactionController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await transactionService.list();
      res.json(items);
    } catch (err) {
      next(err);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const item = await transactionService.get(id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createTransactionSchema.parse(req.body);
      const created = await transactionService.create(parsed);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const parsed = updateTransactionSchema.parse(req.body);
      const updated = await transactionService.update(id, parsed);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await transactionService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
