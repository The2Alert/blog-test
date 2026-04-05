import { PostUser as PrismaPostUser } from '@prisma/client';
import { User } from '@/domain/entity/User';

export interface PostUser extends PrismaPostUser {
  user?: User;
}

export { PostUserRole } from '@prisma/client';
export { postUserSchema } from './schema';
