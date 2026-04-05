import { z } from 'zod';

export const tagSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.string()
});
