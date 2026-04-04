import { RepositoryParams } from '@/adapter/repository/types';
import { RedisClient } from '@/lib/clients/Redis';
import { RedisSetParams } from './types';

export abstract class RedisRepository {
  protected readonly redis: RedisClient;

  constructor(protected readonly params: RepositoryParams) {
    this.redis = params.clients.redis;
  }

  protected readonly keyPrefix: string | string[] = '';

  protected generateKey(key: string | string[]): string {
    return [
      ...(Array.isArray(this.keyPrefix) ? this.keyPrefix : [this.keyPrefix]),
      ...(Array.isArray(key) ? key : [key])
    ].join(':');
  }

  protected get(key: string | string[]): Promise<string | null> {
    return this.redis.get(this.generateKey(key));
  }

  protected async set(
    key: string | string[],
    value: string | number | Buffer,
    { expiresIn = 0 }: RedisSetParams = {}
  ): Promise<void> {
    const generatedKey = this.generateKey(key);

    if (expiresIn) {
      await this.redis.set(generatedKey, value, 'EX', expiresIn);

      return;
    }

    await this.redis.set(generatedKey, value);
  }

  protected async delete(key: string | string[]): Promise<void> {
    await this.redis.del(this.generateKey(key));
  }
}
