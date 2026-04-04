import type { Gateway } from '@/adapter/gateway';
import type { Repository } from '@/adapter/repository';
import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { Service } from '@/domain/service';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';

export interface UseCaseParams {
  appInfo: AppInfo;
  config: Config;
  lib: Lib;
  clients: Clients;
  logger: Logger;
  gateway: Gateway;
  repository: Repository;
  service: Service;
}

export interface UseCaseFunction<
  ExecuteParams extends object | void = void,
  ExecuteResult extends unknown = void
> {
  (
    useCaseParams: UseCaseParams,
    params: ExecuteParams
  ): [ExecuteResult] extends [AsyncGenerator]
    ? ExecuteResult
    : Promise<ExecuteResult>;
}
