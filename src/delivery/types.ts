import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { UseCase } from '@/domain/usecase';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';

export interface DeliveryParams {
  appInfo: AppInfo;
  config: Config;
  lib: Lib;
  clients: Clients;
  logger: Logger;
  useCase: UseCase;
}

export * from './http/types';
