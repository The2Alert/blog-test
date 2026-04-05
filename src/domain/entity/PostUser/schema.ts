import { z } from 'zod';
import { userSchema } from '@/domain/entity/User/schema';

export const postUserSchema = z.object({
  postId: z.number().int(),
  userId: z.number().int(),
  role: z.enum(['EDITOR']),
  user: userSchema.optional(),
  createdAt: z.string()
});
