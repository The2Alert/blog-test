import type { Config } from '@/config';
import type { ApiRouter } from '@/delivery/http/router';

export interface ServerParams {
  config: Config;
  router: ApiRouter;
}
