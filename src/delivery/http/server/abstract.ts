import type { Config } from '@/config';
import type { ApiRouter } from '@/delivery/http/router';
import type { ServerParams } from './types';

export class AbstractServer {
  public readonly config: Config;
  public readonly router: ApiRouter;

  constructor(public readonly params: ServerParams) {
    this.config = params.config;
    this.router = params.router;
  }
}
