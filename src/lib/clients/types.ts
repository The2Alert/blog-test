import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { Lib } from '@/lib';

export interface ClientManagerParams {
  appInfo: AppInfo;
  config: Config;
  lib: Lib;
}
