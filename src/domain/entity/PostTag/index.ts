import { PostTag as PrismaPostTag } from '@prisma/client';
import { Tag } from '@/domain/entity/Tag';

export interface PostTag extends PrismaPostTag {
  tag?: Tag;
}

export { postTagSchema } from './schema';
