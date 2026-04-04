import { User as PrismaUser } from '@prisma/client';
import { File } from '@/domain/entity/File';

export interface User extends PrismaUser {
  avatar128x128?: File | null;
}

export { UserRole } from '@prisma/client';
export { userSchema } from './schema';
