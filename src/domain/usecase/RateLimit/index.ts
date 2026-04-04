import { AbstractUseCase } from '@/domain/usecase/abstract';
import { CheckUseCase } from './Check';

export class RateLimitUseCase extends AbstractUseCase {
  public readonly check = CheckUseCase.bind(null, this.params);
}
