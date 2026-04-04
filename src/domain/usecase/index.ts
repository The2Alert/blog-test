import { AppUseCase } from './App';
import { AuthUseCase } from './Auth';
import { RateLimitUseCase } from './RateLimit';
import { UserUseCase } from './User';
import { AbstractUseCase } from './abstract';
import { UseCaseParams } from './types';

export class UseCase extends AbstractUseCase {
  public static create(params: UseCaseParams): UseCase {
    return new UseCase(params);
  }

  public readonly app = new AppUseCase(this.params).bind();
  public readonly auth = new AuthUseCase(this.params);
  public readonly user = new UserUseCase(this.params);
  public readonly rateLimit = new RateLimitUseCase(this.params);
}
