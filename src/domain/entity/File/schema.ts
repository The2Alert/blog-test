import { z } from 'zod';

export const fileSchema = z.object({
  id: z.string(),
  status: z.enum(['CREATED', 'PENDING', 'ERROR', 'DONE']),
  type: z.enum(['UNKNOWN', 'IMAGE']),
  name: z.string().nullable(),
  size: z.number().int(),
  mimeType: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  blurDataUrl: z.string().nullable(),
  path: z.string().nullable(),
  createdAt: z.string()
});
