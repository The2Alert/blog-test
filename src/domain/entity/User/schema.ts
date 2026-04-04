import { z } from 'zod';
import { fileSchema } from '@/domain/entity/File/schema';

export const userSchema = z.object({
  id: z.number().int(),
  role: z.enum(['USER', 'ADMIN']),
  login: z.string(),
  name: z.string().nullable(),
  avatar128x128Id: z.string().nullable(),
  avatar128x128: fileSchema.nullable().optional(),
  createdAt: z.string()
});
