import { User, UserRole } from '@/domain/entity/User';
import { ServiceFunction } from '@/domain/service/types';

export interface CreateAdminParams {
  id: number;
  login: string;
  password: string;
}

export interface CreateAdminResult {
  user: User;
}

export const CreateAdminService: ServiceFunction<
  CreateAdminParams,
  CreateAdminResult
> = async ({ repository, gateway }, { id, login, password }) => {
  const hashedPassword = await gateway.crypto.hashPassword({
    password
  });

  const role = UserRole.ADMIN;
  const data = {
    id,
    role,
    login,
    hashedPassword
  };

  const user = await repository.user.upsert({
    where: {
      id
    },
    create: data,
    update: data,
    select: 'basic'
  });

  return {
    user
  };
};
