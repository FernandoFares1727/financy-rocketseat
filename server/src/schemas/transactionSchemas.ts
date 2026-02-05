import { z } from 'zod';

export const createTransactionSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  categoryId: z.number().int().positive(),
  date: z.string().optional()
});

export const updateTransactionSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  date: z.string().optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
