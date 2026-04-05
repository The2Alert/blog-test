import { z } from 'zod';

export const errorSchema = z.object({
  status: z.literal('error'),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    errors: z.array(z.record(z.string(), z.unknown())).optional()
  })
});
