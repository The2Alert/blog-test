import { User } from '@/domain/entity/User';
import { ServiceFunction } from '@/domain/service/types';

export interface CheckCredentialsParams {
  login: string;
  password: string;
}

export interface CheckCredentialsResult {
  user: User | null;
}

export const CheckCredentialsService: ServiceFunction<
  CheckCredentialsParams,
  CheckCredentialsResult
> = async ({ repository, gateway }, { login, password }) => {
  let user = await repository.user.get({
    where: {
      login,
      banned: false
    },
    select: {
      id: true,
      hashedPassword: true
    }
  });

  if (!user || typeof user.id !== 'number') {
    return {
      user: null
    };
  }

  const { hashedPassword } = user;

  if (
    !(await gateway.crypto.comparePassword({
      password,
      hashedPassword
    }))
  ) {
    return {
      user: null
    };
  }

  user = await repository.user.get({
    where: {
      login
    },
    select: 'basic'
  });

  return {
    user
  };
};
