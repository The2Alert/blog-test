import { FileRepository } from './File';
import { PostRepository } from './Post';
import { PostTagRepository } from './PostTag';
import { PostUserRepository } from './PostUser';
import { PrismaTx } from './Prisma/types';
import { RateLimitRepository } from './RateLimit';
import { TagRepository } from './Tag';
import { UserRepository } from './User';
import { AbstractRepository } from './abstract';

export class Repository extends AbstractRepository {
  public readonly user = new UserRepository(this.params);
  public readonly file = new FileRepository(this.params);
  public readonly rateLimit = new RateLimitRepository(this.params);
  public readonly tag = new TagRepository(this.params);
  public readonly post = new PostRepository(this.params);
  public readonly postTag = new PostTagRepository(this.params);
  public readonly postUser = new PostUserRepository(this.params);

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
