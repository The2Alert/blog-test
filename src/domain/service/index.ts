import { AuthService } from './Auth';
import { PostService } from './Post';
import { RateLimitService } from './RateLimit';
import { UserService } from './User';
import { AbstractService } from './abstract';
import { ServiceParams } from './types';

export class Service extends AbstractService {
  public static create(params: ServiceParams): Service {
    return new Service(params);
  }

  public readonly user = new UserService(this.params);
  public readonly auth = new AuthService(this.params);
  public readonly rateLimit = new RateLimitService(this.params);
  public readonly post = new PostService(this.params);
}
