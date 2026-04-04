import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';

export interface AdapterParams {
  appInfo: AppInfo;
  config: Config;
  lib: Lib;
  clients: Clients;
  logger: Logger;
}
