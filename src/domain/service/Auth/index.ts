import { AbstractService } from '@/domain/service/abstract';
import { CheckCredentialsService } from './CheckCredentials';
import { GenerateTokensService } from './GenerateTokens';
import { RefreshTokensService } from './RefreshTokens';
import { VerifyService } from './Verify';

export class AuthService extends AbstractService {
  public readonly checkCredentials = CheckCredentialsService.bind(
    null,
    this.params
  );
  public readonly generateTokens = GenerateTokensService.bind(
    null,
    this.params
  );
  public readonly refreshTokens = RefreshTokensService.bind(null, this.params);
  public readonly verify = VerifyService.bind(null, this.params);
}
