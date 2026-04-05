import { Post as PrismaPost } from '@prisma/client';
import { PostTag } from '@/domain/entity/PostTag';
import { PostUser } from '@/domain/entity/PostUser';

export interface Post extends PrismaPost {
  users?: PostUser[];
  tags?: PostTag[];
}

export { postSchema } from './schema';
