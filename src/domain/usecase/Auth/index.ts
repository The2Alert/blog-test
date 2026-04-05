import { AbstractUseCase } from '@/domain/usecase/abstract';
import { AuthorizeUseCase } from './Authorize';
import { GetUserUseCase } from './GetUser';
import { RefreshTokensUseCase } from './RefreshTokens';
import { RegisterUseCase } from './Register';
import { VerifyUseCase } from './Verify';

export class AuthUseCase extends AbstractUseCase {
  public readonly authorize = AuthorizeUseCase.bind(null, this.params);
  public readonly register = RegisterUseCase.bind(null, this.params);
  public readonly verify = VerifyUseCase.bind(null, this.params);
  public readonly getUser = GetUserUseCase.bind(null, this.params);
  public readonly refreshTokens = RefreshTokensUseCase.bind(null, this.params);
}
