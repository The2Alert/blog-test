import { UserRole } from '@/domain/entity/User';
import { ServiceFunction } from '@/domain/service/types';

export interface GenerateTokensParams {
  user: {
    id: number;
    role: UserRole;
  };
}

export interface GenerateTokensResult {
  accessToken: string;
  refreshToken: string;
}

export const GenerateTokensService: ServiceFunction<
  GenerateTokensParams,
  GenerateTokensResult
> = async ({ gateway }, { user }) => ({
  accessToken: gateway.auth.generateToken({
    type: 'access',
    user
  }),
  refreshToken: gateway.auth.generateToken({
    type: 'refresh',
    user
  })
});
