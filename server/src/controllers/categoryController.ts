import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchemas';
import { ApiError } from '../utils/ApiError';

export const categoryController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await categoryService.list();
      res.json(items);
    } catch (err) {
      next(err);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const item = await categoryService.get(id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createCategorySchema.parse(req.body);
      const created = await categoryService.create(parsed);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof ApiError) return next(err);
      next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const parsed = updateCategorySchema.parse(req.body);
      const updated = await categoryService.update(id, parsed);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await categoryService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
