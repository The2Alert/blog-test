import { NotFoundError } from '@/domain/errors';
import { ServiceFunction } from '@/domain/service/types';

export interface UnbanParams {
  login: string;
}

export const UnbanService: ServiceFunction<UnbanParams, void> = async (
  { repository },
  { login }
) => {
  const user = await repository.user.get({
    where: { login }
  });

  if (!user) {
    throw new NotFoundError({
      code: 'USER_NOT_FOUND',
      message: 'User not found.'
    });
  }

  await repository.user.update({
    where: { id: user.id },
    data: { banned: false }
  });
};
