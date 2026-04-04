import { UseCaseFunction } from '@/domain/usecase/types';

export interface RefreshTokensParams {
  refreshToken: string;
}

export interface RefreshTokensResult {
  accessToken: string;
  refreshToken: string;
}

export const RefreshTokensUseCase: UseCaseFunction<
  RefreshTokensParams,
  RefreshTokensResult
> = ({ service }, { refreshToken }) =>
  service.auth.refreshTokens({ refreshToken });
