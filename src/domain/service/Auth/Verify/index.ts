import { UserRole } from '@/domain/entity/User';
import { ForbiddenError, UnauthorizedError } from '@/domain/errors';
import { ServiceFunction } from '@/domain/service/types';

export interface VerifyParams {
  token: string | null;
  adminOnly?: boolean;
}

export interface VerifyResult {
  userId: number;
  userRole: UserRole;
}

export const VerifyService: ServiceFunction<
  VerifyParams,
  VerifyResult
> = async ({ gateway }, { token, adminOnly = false }) => {
  if (!token) {
    throw new UnauthorizedError();
  }

  const tokenPayload = gateway.auth.verifyToken({ token });

  if (!tokenPayload) {
    throw new UnauthorizedError();
  }
  if (adminOnly && tokenPayload.userRole !== UserRole.ADMIN) {
    throw new ForbiddenError();
  }

  return {
    userId: tokenPayload.userId,
    userRole: tokenPayload.userRole
  };
};
