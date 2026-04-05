import { Prisma } from '@prisma/client';
import { PrismaRepository } from '@/adapter/repository/Prisma';
import { PrismaTx } from '@/adapter/repository/Prisma/types';
import { RepositoryParams } from '@/adapter/repository/types';
import { Tag } from '@/domain/entity/Tag';

export const tagDefaultSelect: Prisma.TagSelect = {
  id: true,
  name: true,
  createdAt: true
};

export class TagRepository extends PrismaRepository<Tag, 'Tag', 'default'> {
  constructor(protected readonly params: RepositoryParams) {
    const {
      clients: { prisma }
    } = params;

    super(params, (tx) => prisma.getContextClient(tx).tag, {
      select: { default: tagDefaultSelect }
    });
  }

  public async upsertByNames(
    { names }: { names: string[] },
    tx?: PrismaTx
  ): Promise<Tag[]> {
    return Promise.all(
      names.map((name) =>
        this.upsert(
          {
            where: { name },
            create: { name },
            update: {},
            select: 'default'
          },
          tx
        )
      )
    );
  }
}
