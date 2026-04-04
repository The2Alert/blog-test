import { AbstractGateway } from '@/adapter/gateway/abstract';
import { GenerateTokenParams, TokenPayload, VerifyTokenParams } from './types';

export class AuthGateway extends AbstractGateway {
  private readonly jwt = this.lib.jwt;

  public generateToken({ type, user }: GenerateTokenParams): string {
    const { jwt, config } = this;

    return jwt.sign(
      {
        userId: user.id,
        userRole: user.role
      } satisfies TokenPayload,
      config.jwt.secret,
      {
        ...(type === 'access' && {
          expiresIn: '24h'
        })
      }
    );
  }

  public verifyToken({ token }: VerifyTokenParams): TokenPayload | null {
    const { jwt, config } = this;

    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}
