import { Prisma } from '@prisma/client';
import { PrismaRepository } from '@/adapter/repository/Prisma';
import { RepositoryParams } from '@/adapter/repository/types';
import { File } from '@/domain/entity/File';

export const fileDefaultSelect: Prisma.FileSelect = {
  id: true,
  status: true,
  type: true,
  name: true,
  size: true,
  mimeType: true,
  width: true,
  height: true,
  blurDataUrl: true,
  path: true,
  createdAt: true
};

export class FileRepository extends PrismaRepository<File, 'File', 'default'> {
  constructor(protected readonly params: RepositoryParams) {
    const {
      clients: { prisma }
    } = params;

    super(params, (tx) => prisma.getContextClient(tx).file, {
      select: {
        default: fileDefaultSelect
      }
    });
  }
}
