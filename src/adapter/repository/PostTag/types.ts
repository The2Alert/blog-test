import { PrismaTx } from '@/adapter/repository/Prisma/types';

export interface ReplaceTagsParams {
  postId: number;
  tagIds: number[];
  tx?: PrismaTx;
}
