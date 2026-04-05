import { Prisma } from '@prisma/client';
import { AbstractRepository } from '@/adapter/repository/abstract';
import { RepositoryParams } from '@/adapter/repository/types';
import {
  OperationArgs,
  OperationInclude,
  OperationSelect,
  PrismaModelName,
  PrismaNativeRepository,
  PrismaRepositoryParams,
  PrismaTx
} from './types';

export abstract class PrismaRepository<
  Model,
  ModelName extends PrismaModelName,
  SelectMapKey extends string = string,
  IncludeMapKey extends string = string,
  NativeRepository extends PrismaNativeRepository<ModelName> =
    PrismaNativeRepository<ModelName>,
  SelectMap extends Record<SelectMapKey, OperationSelect<ModelName>> = Record<
    SelectMapKey,
    OperationSelect<ModelName>
  >,
  IncludeMap extends Record<IncludeMapKey, OperationInclude<ModelName>> =
    Record<IncludeMapKey, OperationInclude<ModelName>>
> extends AbstractRepository {
  public select: SelectMap | null;
  public include: IncludeMap | null;

  constructor(
    protected readonly params: RepositoryParams,
    protected readonly getNativeRepository: (tx?: PrismaTx) => NativeRepository,
    {
      select = null,
      include = null
    }: PrismaRepositoryParams<SelectMap, IncludeMap> = {}
  ) {
    super(params);

    this.select = select;
    this.include = include;
  }

  private getSelect(
    select?: keyof SelectMap | OperationSelect<ModelName>
  ): OperationSelect<ModelName> | undefined {
    if (typeof select === 'boolean') {
      return select;
    } else if (typeof select === 'string') {
      return this.select?.[select];
    } else if (typeof select === 'object') {
      return select;
    } else if (
      this.select &&
      'default' in this.select &&
      typeof this.select.default === 'object'
    ) {
      return this.select.default;
    }
  }

  private getInclude(
    include?: keyof IncludeMap | OperationInclude<ModelName>
  ): OperationInclude<ModelName> | undefined {
    if (typeof include === 'string') {
      return this.include?.[include];
    } else if (typeof include === 'object') {
      return include;
    }
  }

  public async count(
    params?: OperationArgs<ModelName, 'count'>,
    tx?: PrismaTx
  ): Promise<number> {
    return (await this.getNativeRepository(tx).count(params)) as number;
  }

  public async create(
    {
      select,
      include,
      ...args
    }: Omit<OperationArgs<ModelName, 'create'>, 'select' | 'include'> & {
      select?: keyof SelectMap | OperationSelect<ModelName>;
      include?: keyof IncludeMap | OperationInclude<ModelName>;
    },
    tx?: PrismaTx
  ): Promise<Model> {
    return (await this.getNativeRepository(tx).create({
      ...(args as OperationArgs<ModelName, 'create'>),
      select: this.getSelect(select),
      include: this.getInclude(include)
    })) as Model;
  }

  public async delete(
    {
      select,
      include,
      ...args
    }: Omit<OperationArgs<ModelName, 'delete'>, 'select' | 'include'> & {
      select?: keyof SelectMap | OperationSelect<ModelName>;
      include?: keyof IncludeMap | OperationInclude<ModelName>;
    },
    tx?: PrismaTx
  ): Promise<Model | null> {
    try {
      return (await this.getNativeRepository(tx).delete({
        ...(args as OperationArgs<ModelName, 'delete'>),
        select: this.getSelect(select),
        include: this.getInclude(include)
      })) as Model;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  public async deleteMany(
    params?: OperationArgs<ModelName, 'deleteMany'>,
    tx?: PrismaTx
  ): Promise<number> {
    const { count } = await this.getNativeRepository(tx).deleteMany(params);

    return count;
  }

  public async get(
    {
      select,
      include,
      ...args
    }: Omit<OperationArgs<ModelName, 'findFirst'>, 'select' | 'include'> & {
      select?: keyof SelectMap | OperationSelect<ModelName>;
      include?: keyof IncludeMap | OperationInclude<ModelName>;
    },
    tx?: PrismaTx
  ): Promise<Model | null> {
    return (await this.getNativeRepository(tx).findFirst({
      ...(args as OperationArgs<ModelName, 'findFirst'>),
      select: this.getSelect(select),
      include: this.getInclude(include)
    })) as Model | null;
  }

  public async getList(
    {
      select,
      include,
      ...args
    }: Omit<OperationArgs<ModelName, 'findMany'>, 'select' | 'include'> & {
      select?: keyof SelectMap | OperationSelect<ModelName>;
      include?: keyof IncludeMap | OperationInclude<ModelName>;
    },
    tx?: PrismaTx
  ): Promise<Model[]> {
    return (await this.getNativeRepository(tx).findMany({
      ...(args as OperationArgs<ModelName, 'findMany'>),
      select: this.getSelect(select),
      include: this.getInclude(include)
    })) as unknown as Model[];
  }

  public async update(
    {
      select,
      include,
      ...args
    }: Omit<OperationArgs<ModelName, 'update'>, 'select' | 'include'> & {
      select?: keyof SelectMap | OperationSelect<ModelName>;
      include?: keyof IncludeMap | OperationInclude<ModelName>;
    },
    tx?: PrismaTx
  ): Promise<Model | null> {
    try {
      return (await this.getNativeRepository(tx).update({
        ...(args as OperationArgs<ModelName, 'update'>),
        select: this.getSelect(select),
        include: this.getInclude(include)
      })) as Model;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  public async updateMany(
    params: OperationArgs<ModelName, 'updateMany'>,
    tx?: PrismaTx
  ): Promise<number> {
    const { count } = await this.getNativeRepository(tx).updateMany(params);

    return count;
  }

  public async upsert(
    {
      select,
      include,
      ...args
    }: Omit<OperationArgs<ModelName, 'upsert'>, 'select' | 'include'> & {
      select?: keyof SelectMap | OperationSelect<ModelName>;
      include?: keyof IncludeMap | OperationInclude<ModelName>;
    },
    tx?: PrismaTx
  ): Promise<Model> {
    return (await this.getNativeRepository(tx).upsert({
      ...(args as OperationArgs<ModelName, 'upsert'>),
      select: this.getSelect(select),
      include: this.getInclude(include)
    })) as Model;
  }

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
