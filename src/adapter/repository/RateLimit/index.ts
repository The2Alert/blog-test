import { RedisRepository } from '@/adapter/repository/Redis';

export interface RateLimitIncrementParams {
  key: string;
  windowMs: number;
}

export interface RateLimitIncrementResult {
  count: number;
}

export class RateLimitRepository extends RedisRepository {
  protected readonly keyPrefix = 'RateLimit';

  public async increment({
    key,
    windowMs
  }: RateLimitIncrementParams): Promise<RateLimitIncrementResult> {
    const generatedKey = this.generateKey(key);
    const count = await this.redis.incr(generatedKey);

    if (count === 1) {
      await this.redis.pexpire(generatedKey, windowMs);
    }

    return { count };
  }
}
