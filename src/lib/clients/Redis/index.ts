import { Redis } from 'ioredis';
import { RedisClientParams } from './types';

export class RedisClient extends Redis {
  public static async connect(params: RedisClientParams) {
    return new RedisClient(params);
  }

  constructor({ host, port, user, password }: RedisClientParams) {
    super(port, host, {
      username: user,
      password
    });
  }
}
