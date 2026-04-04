import { AbstractService } from '@/domain/service/abstract';
import { CheckService } from './Check';

export class RateLimitService extends AbstractService {
  public readonly check = CheckService.bind(null, this.params);
}
