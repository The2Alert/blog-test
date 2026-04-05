import { z } from 'zod';
import { fileSchema } from '@/domain/entity/File';
import { postTagSchema } from '@/domain/entity/PostTag';
import { postUserSchema } from '@/domain/entity/PostUser';

export const postSchema = z.object({
  id: z.number().int(),
  slug: z.string().nullable(),
  title: z.string(),
  htmlTitle: z.string(),
  description: z.string(),
  htmlDescription: z.string(),
  content: z.string().optional(),
  htmlContent: z.string().optional(),
  deleted: z.boolean(),
  preview1x1Id: z.string().nullable(),
  preview1x1: fileSchema.nullable().optional(),
  preview4x3Id: z.string().nullable(),
  preview4x3: fileSchema.nullable().optional(),
  preview16x9Id: z.string().nullable(),
  preview16x9: fileSchema.nullable().optional(),
  users: z.array(postUserSchema).optional(),
  tags: z.array(postTagSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});
