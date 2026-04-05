import { User } from '@/domain/entity/User';
import { NotFoundError } from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface GetByIdOrLoginParams {
  idOrLogin: string;
}

export interface GetByIdOrLoginResult {
  user: User;
}

export const GetByIdOrLoginUseCase: UseCaseFunction<
  GetByIdOrLoginParams,
  GetByIdOrLoginResult
> = async ({ repository }, { idOrLogin }) => {
  const numericId = Number(idOrLogin);
  const isId = Number.isInteger(numericId) && String(numericId) === idOrLogin;

  const user = await repository.user.get({
    where: {
      ...(isId && { id: numericId }),
      ...(!isId && { login: idOrLogin }),
      banned: false
    },
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
