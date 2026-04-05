import { Prisma } from '@prisma/client';
import { PrismaRepository } from '@/adapter/repository/Prisma';
import { RepositoryParams } from '@/adapter/repository/types';
import { PostTag } from '@/domain/entity/PostTag';
import { ReplaceTagsParams } from './types';

export const postTagDefaultSelect: Prisma.PostTagSelect = {
  postId: true,
  tagId: true,
  order: true,
  tag: true
};

export class PostTagRepository extends PrismaRepository<
  PostTag,
  'PostTag',
  'default'
> {
  constructor(protected readonly params: RepositoryParams) {
    const {
      clients: { prisma }
    } = params;

    super(params, (tx) => prisma.getContextClient(tx).postTag, {
      select: { default: postTagDefaultSelect }
    });
  }

  public replaceTags({ postId, tagIds, tx }: ReplaceTagsParams): Promise<void> {
    return this.$transaction(async (tx) => {
      await this.deleteMany({ where: { postId } }, tx);

      if (tagIds.length === 0) {
        return;
      }

      await Promise.all(
        tagIds.map((tagId, index) =>
          this.create({ data: { postId, tagId, order: index } }, tx)
        )
      );
    }, tx);
  }
}
