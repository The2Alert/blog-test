import { UserRole } from '@/domain/entity/User';
import { ForbiddenError, NotFoundError } from '@/domain/errors';
import { ServiceFunction } from '@/domain/service/types';

export interface BanParams {
  login: string;
  banReason?: string | null;
}

export const BanService: ServiceFunction<BanParams, void> = async (
  { repository },
  { login, banReason = null }
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

  if (user.role === UserRole.ADMIN) {
    throw new ForbiddenError({
      code: 'ADMIN_BAN_FORBIDDEN',
      message: 'Cannot ban admin user.'
    });
  }

  await repository.user.update({
    where: { id: user.id },
    data: { banned: true, banReason }
  });
};
