import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/library.js';
import { AdapterParams } from '@/adapter/types';

export type PrismaModelName = keyof Prisma.TypeMap['model'];

export type ModelOperations<ModelName extends PrismaModelName> =
  Prisma.TypeMap['model'][ModelName]['operations'];

export type OperationArgs<
  ModelName extends PrismaModelName,
  Operation extends keyof ModelOperations<ModelName>
> = 'args' extends keyof ModelOperations<ModelName>[Operation]
  ? ModelOperations<ModelName>[Operation]['args']
  : never;

export type OperationResult<
  ModelName extends PrismaModelName,
  OperationName extends keyof ModelOperations<ModelName>
> = 'result' extends keyof ModelOperations<ModelName>[OperationName]
  ? ModelOperations<ModelName>[OperationName]['result']
  : never;

export type OperationSelect<ModelName extends PrismaModelName> = OperationArgs<
  ModelName,
  'findFirst'
>['select'];

export type OperationInclude<ModelName extends PrismaModelName> =
  'include' extends keyof OperationArgs<ModelName, 'findFirst'>
    ? OperationArgs<ModelName, 'findFirst'>
    : never;

export interface PrismaNativeRepository<ModelName extends PrismaModelName> {
  count: (
    args?: OperationArgs<ModelName, 'count'>
  ) => Promise<OperationResult<ModelName, 'count'>>;
  create: (
    args: OperationArgs<ModelName, 'create'>
  ) => Promise<OperationResult<ModelName, 'create'>>;
  delete: (
    args: OperationArgs<ModelName, 'delete'>
  ) => Promise<OperationResult<ModelName, 'delete'>>;
  deleteMany: (
    args?: OperationArgs<ModelName, 'deleteMany'>
  ) => Promise<OperationResult<ModelName, 'deleteMany'>>;
  findFirst: (
    args: OperationArgs<ModelName, 'findFirst'>
  ) => Promise<OperationResult<ModelName, 'findFirst'>>;
  findMany: (
    args?: OperationArgs<ModelName, 'findMany'>
  ) => Promise<OperationResult<ModelName, 'findMany'>>;
  update: (
    args: OperationArgs<ModelName, 'update'>
  ) => Promise<OperationResult<ModelName, 'update'>>;
  updateMany: (
    args: OperationArgs<ModelName, 'updateMany'>
  ) => Promise<OperationResult<ModelName, 'updateMany'>>;
  upsert: (
    args: OperationArgs<ModelName, 'upsert'>
  ) => Promise<OperationResult<ModelName, 'upsert'>>;
}

export interface PrismaRepositoryParams<
  SelectMap extends unknown = unknown,
  IncludeMap extends unknown = unknown
> {
  select?: SelectMap | null;
  include?: IncludeMap | null;
}

export type RepositoryParams = AdapterParams;

export type PrismaTx = Omit<PrismaClient, ITXClientDenyList>;
