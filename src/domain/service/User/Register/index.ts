import { User } from '@/domain/entity/User';
import { InvalidDataError } from '@/domain/errors';
import { ServiceFunction } from '@/domain/service/types';

export interface RegisterParams {
  login: string;
  password: string;
  name?: string | null;
}

export interface RegisterResult {
  user: User;
}

export const RegisterService: ServiceFunction<
  RegisterParams,
  RegisterResult
> = ({ repository, gateway }, { login, password, name }) =>
  repository.$transaction(async (tx) => {
    const existingUser = await repository.user.get({ where: { login } }, tx);

    if (existingUser) {
      throw new InvalidDataError({
        code: 'LOGIN_ALREADY_EXISTS',
        message: 'Login already exists.'
      });
    }

    const hashedPassword = await gateway.crypto.hashPassword({ password });

    const user = await repository.user.create(
      {
        data: { login, name: name ?? null, hashedPassword },
        select: 'basic'
      },
      tx
    );

    return { user };
  });
