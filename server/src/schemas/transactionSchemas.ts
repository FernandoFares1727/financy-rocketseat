import { z } from 'zod';

export const createTransactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.number().int().positive('Category is required'),
  date: z.string().optional()
});

export const updateTransactionSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.number().int().positive().optional(),
  date: z.string().optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
