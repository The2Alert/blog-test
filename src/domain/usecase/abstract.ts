import type { Gateway } from '@/adapter/gateway';
import type { Repository } from '@/adapter/repository';
import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { Service } from '@/domain/service';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';
import type { UseCaseParams } from './types';

export abstract class AbstractUseCase<
  ExecuteParams extends object | void = void,
  ExecuteResult extends unknown = void
> {
  protected readonly appInfo: AppInfo;
  protected readonly config: Config;
  protected readonly lib: Lib;
  protected readonly clients: Clients;
  protected readonly logger: Logger;
  protected readonly gateway: Gateway;
  protected readonly repository: Repository;
  protected readonly service: Service;

  constructor(protected readonly params: UseCaseParams) {
    this.appInfo = params.appInfo;
    this.config = params.config;
    this.lib = params.lib;
    this.clients = params.clients;
    this.logger = params.logger;
    this.gateway = params.gateway;
    this.repository = params.repository;
    this.service = params.service;
  }

  public async execute(params: ExecuteParams): Promise<ExecuteResult> {
    throw new Error(
      `Execute not found.\nExecute Params: ${JSON.stringify(params)}`
    );
  }

  public bind() {
    return this.execute.bind(this);
  }
}
