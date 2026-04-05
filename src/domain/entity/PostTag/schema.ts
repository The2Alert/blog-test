import { z } from 'zod';
import { tagSchema } from '@/domain/entity/Tag/schema';

export const postTagSchema = z.object({
  postId: z.number().int(),
  tagId: z.number().int(),
  order: z.number().int(),
  tag: tagSchema.optional()
});
