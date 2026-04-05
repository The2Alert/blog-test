import { User } from '@/domain/entity/User';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface RegisterParams {
  login: string;
  password: string;
  name?: string | null;
}

export interface RegisterResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const RegisterUseCase: UseCaseFunction<
  RegisterParams,
  RegisterResult
> = async ({ service }, params) => {
  const { user } = await service.user.register(params);
  const { accessToken, refreshToken } = await service.auth.generateTokens({
    user
  });

  return { user, accessToken, refreshToken };
};
