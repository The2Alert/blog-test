import { Post } from '@/domain/entity/Post';
import { UseCaseFunction } from '@/domain/usecase/types';
import { DEFAULT_LIMIT, MAX_LIMIT } from './constants';

export interface GetListParams {
  cursor?: number | null;
  limit?: number;
}

export interface GetListResult {
  data: Post[];
  nextCursor: number | null;
}

export const GetListUseCase: UseCaseFunction<
  GetListParams,
  GetListResult
> = async ({ repository }, { cursor, limit: rawLimit }) => {
  const limit = Math.min(rawLimit ?? DEFAULT_LIMIT, MAX_LIMIT);

  const posts = await repository.post.getList({
    where: { deleted: false },
    orderBy: { id: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: 'list'
  });

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return { data, nextCursor };
};
