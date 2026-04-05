import { User } from '@/domain/entity/User';
import { UseCaseFunction } from '@/domain/usecase/types';
import { DEFAULT_LIMIT, MAX_LIMIT } from './constants';

export interface GetListParams {
  cursor?: number | null;
  limit?: number;
}

export interface GetListResult {
  data: User[];
  nextCursor: number | null;
}

export const GetListUseCase: UseCaseFunction<
  GetListParams,
  GetListResult
> = async ({ repository }, { cursor, limit: rawLimit }) => {
  const limit = Math.min(rawLimit ?? DEFAULT_LIMIT, MAX_LIMIT);

  const users = await repository.user.getList({
    where: { banned: false },
    orderBy: { id: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: 'basic'
  });

  const hasMore = users.length > limit;
  const data = hasMore ? users.slice(0, limit) : users;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return { data, nextCursor };
};
