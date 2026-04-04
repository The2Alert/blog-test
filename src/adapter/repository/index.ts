import { FileRepository } from './File';
import { PrismaTx } from './Prisma/types';
import { RateLimitRepository } from './RateLimit';
import { UserRepository } from './User';
import { AbstractRepository } from './abstract';

export class Repository extends AbstractRepository {
  public readonly user = new UserRepository(this.params);
  public readonly file = new FileRepository(this.params);
  public readonly rateLimit = new RateLimitRepository(this.params);

  public $transaction<T>(
    callback: (tx: PrismaTx) => Promise<T>,
    tx?: PrismaTx
  ): Promise<T> {
    if (tx) {
      return callback(tx);
    }

    return this.params.clients.prisma.$transaction(callback);
  }
}
