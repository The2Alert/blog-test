import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';
import type { RepositoryParams } from './types';

export abstract class AbstractRepository {
  protected readonly appInfo: AppInfo;
  protected readonly config: Config;
  protected readonly lib: Lib;
  protected readonly clients: Clients;
  protected readonly logger: Logger;

  constructor(protected readonly params: RepositoryParams) {
    this.appInfo = params.appInfo;
    this.config = params.config;
    this.lib = params.lib;
    this.clients = params.clients;
    this.logger = params.logger;
  }
}
