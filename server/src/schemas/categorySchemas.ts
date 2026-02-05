import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
