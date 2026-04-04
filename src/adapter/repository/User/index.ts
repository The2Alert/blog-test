import { Prisma } from '@prisma/client';
import { PrismaRepository } from '@/adapter/repository/Prisma';
import { RepositoryParams } from '@/adapter/repository/types';
import { User } from '@/domain/entity/User';

export const userDefaultSelect: Prisma.UserSelect = {
  id: true,
  role: true,
  login: true,
  name: true,
  avatar128x128Id: true,
  createdAt: true
};

export const userBasicSelect: Prisma.UserSelect = {
  ...userDefaultSelect,
  avatar128x128Id: true,
  avatar128x128: true
};

export const userFullSelect: Prisma.UserSelect = {
  ...userBasicSelect,
  hashedPassword: true,
  banned: true
};

export class UserRepository extends PrismaRepository<
  User,
  'User',
  'default' | 'basic' | 'full'
> {
  constructor(protected readonly params: RepositoryParams) {
    const {
      clients: { prisma }
    } = params;

    super(params, (tx) => prisma.getContextClient(tx).user, {
      select: {
        default: userDefaultSelect,
        basic: userBasicSelect,
        full: userFullSelect
      }
    });
  }
}
