import { Prisma } from '@prisma/client';
import { PrismaRepository } from '@/adapter/repository/Prisma';
import { userDefaultSelect } from '@/adapter/repository/User';
import { RepositoryParams } from '@/adapter/repository/types';
import { PostUser } from '@/domain/entity/PostUser';

export const postUserDefaultSelect: Prisma.PostUserSelect = {
  postId: true,
  userId: true,
  role: true,
  user: { select: userDefaultSelect },
  createdAt: true
};

export class PostUserRepository extends PrismaRepository<
  PostUser,
  'PostUser',
  'default'
> {
  constructor(protected readonly params: RepositoryParams) {
    const {
      clients: { prisma }
    } = params;

    super(params, (tx) => prisma.getContextClient(tx).postUser, {
      select: { default: postUserDefaultSelect }
    });
  }
}
