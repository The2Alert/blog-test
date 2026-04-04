import { User } from '@/domain/entity/User';
import { UnauthorizedError } from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface AuthorizeParams {
  login: string;
  password: string;
}

export interface AuthorizeResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const AuthorizeUseCase: UseCaseFunction<
  AuthorizeParams,
  AuthorizeResult
> = async ({ service }, { login, password }) => {
  const { user } = await service.auth.checkCredentials({
    login,
    password
  });

  if (!user) {
    throw new UnauthorizedError();
  }

  const { accessToken, refreshToken } = await service.auth.generateTokens({
    user
  });

  return { user, accessToken, refreshToken };
};
