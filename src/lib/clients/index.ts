import { PrismaClient } from './Prisma';
import { RedisClient } from './Redis';
import { ClientManagerParams } from './types';

export class ClientManager {
  public static connect(params: ClientManagerParams) {
    const clientManager = new ClientManager(params);

    return clientManager.connect();
  }

  constructor(protected readonly params: ClientManagerParams) {}

  public async connect() {
    const { config } = this.params;

    const [prisma, redis] = await Promise.all([
      PrismaClient.connect({
        host: config.postgres.host,
        port: config.postgres.port,
        db: config.postgres.db,
        user: config.postgres.user,
        password: config.postgres.password
      }),
      RedisClient.connect({
        host: config.redis.host,
        port: config.redis.port,
        user: config.redis.user,
        password: config.redis.password
      })
    ]);

    return { prisma, redis };
  }
}

export type Clients = Awaited<ReturnType<ClientManager['connect']>>;
