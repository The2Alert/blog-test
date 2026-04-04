import type { Gateway } from '@/adapter/gateway';
import type { Repository } from '@/adapter/repository';
import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';
import type { Service } from '.';

export interface ServiceParams {
  appInfo: AppInfo;
  config: Config;
  lib: Lib;
  clients: Clients;
  logger: Logger;
  gateway: Gateway;
  repository: Repository;
  service?: Service;
}

export type AbstractServiceParams = Omit<ServiceParams, 'service'> & {
  service: Service;
};

export interface ServiceFunction<
  ExecuteParams extends object | void = void,
  ExecuteResult extends unknown = void
> {
  (
    serviceParams: AbstractServiceParams,
    params: ExecuteParams
  ): [ExecuteResult] extends [AsyncGenerator]
    ? ExecuteResult
    : Promise<ExecuteResult>;
}
