import type { Gateway } from '@/adapter/gateway';
import type { Repository } from '@/adapter/repository';
import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';
import { Service } from '.';
import type { AbstractServiceParams, ServiceParams } from './types';

export abstract class AbstractService<
  ExecuteParams extends object | void = void,
  ExecuteResult extends unknown = void
> {
  protected readonly params: AbstractServiceParams;
  protected readonly appInfo: AppInfo;
  protected readonly config: Config;
  protected readonly lib: Lib;
  protected readonly clients: Clients;
  protected readonly logger: Logger;
  protected readonly gateway: Gateway;
  protected readonly repository: Repository;
  protected readonly service: Service;

  constructor(params: ServiceParams) {
    this.appInfo = params.appInfo;
    this.config = params.config;
    this.lib = params.lib;
    this.clients = params.clients;
    this.logger = params.logger;
    this.gateway = params.gateway;
    this.repository = params.repository;

    if (params.service) {
      this.service = params.service;
    } else if (this instanceof Service) {
      this.service = this;
    } else {
      throw new Error('Service not found.');
    }

    this.params = {
      ...params,
      service: this.service
    };
  }

  public execute(
    params: ExecuteParams
  ): [ExecuteResult] extends [AsyncGenerator]
    ? ExecuteResult
    : Promise<ExecuteResult> {
    throw new Error(
      `Execute not found.\nExecute Params: ${JSON.stringify(params)}`
    );
  }

  public bind() {
    return this.execute.bind(this);
  }
}
