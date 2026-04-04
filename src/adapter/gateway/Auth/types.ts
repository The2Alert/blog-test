import { UserRole } from '@/domain/entity/User';

export interface TokenPayload {
  userId: number;
  userRole: UserRole;
}

export type TokenType = 'access' | 'refresh';

export interface GenerateTokenParams {
  type: TokenType;
  user: {
    id: number;
    role: UserRole;
  };
}

export interface VerifyTokenParams {
  token: string;
}
