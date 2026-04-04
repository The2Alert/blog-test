import { UnauthorizedError } from '@/domain/errors';
import { ServiceFunction } from '@/domain/service/types';

export interface RefreshTokensParams {
  refreshToken: string;
}

export interface RefreshTokensResult {
  accessToken: string;
  refreshToken: string;
}

export const RefreshTokensService: ServiceFunction<
  RefreshTokensParams,
  RefreshTokensResult
> = async ({ gateway, service }, { refreshToken }) => {
  const tokenPayload = gateway.auth.verifyToken({ token: refreshToken });

  if (!tokenPayload) {
    throw new UnauthorizedError({
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token.'
    });
  }

  return service.auth.generateTokens({
    user: { id: tokenPayload.userId, role: tokenPayload.userRole }
  });
};
