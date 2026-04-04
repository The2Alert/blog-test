import { User } from '@/domain/entity/User';
import { NotFoundError } from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface GetUserParams {
  userId: number;
}

export interface GetUserResult {
  user: User;
}

export const GetUserUseCase: UseCaseFunction<
  GetUserParams,
  GetUserResult
> = async ({ repository }, { userId }) => {
  const user = await repository.user.get({
    where: { id: userId, banned: false },
    select: 'basic'
  });

  if (!user) {
    throw new NotFoundError({
      code: 'USER_NOT_FOUND',
      message: 'User not found.'
    });
  }

  return { user };
};
