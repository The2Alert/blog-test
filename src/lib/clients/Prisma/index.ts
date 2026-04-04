import { PrismaClient as Client } from '@prisma/client';
import { PrismaTx } from '@/adapter/repository/Prisma/types';
import { PrismaClientParams } from './types';

export class PrismaClient extends Client {
  public static connect(params: PrismaClientParams): PrismaClient {
    const prismaClient = new PrismaClient(params);

    return prismaClient;
  }

  constructor({ user, password, host, port, db }: PrismaClientParams) {
    super({
      datasources: {
        db: {
          url: `postgresql://${user}:${password}@${host}:${port}/${db}?connection_limit=100`
        }
      }
    });
  }

  public getContextClient(tx?: PrismaTx) {
    return tx ?? this;
  }
}
