import { Server } from '@/delivery/http/server';
import { AbstractHttp } from './abstract';
import { MiddlewareManager } from './middlewares';
import { ApiRouter } from './router';
import { HttpParams } from './types';

export class Http extends AbstractHttp {
  public static create(params: HttpParams): Http {
    return new Http(params);
  }

  public readonly middlewares = MiddlewareManager.create(this.params);
  public readonly router = new ApiRouter({
    ...this.params,
    ...this.middlewares
  });
  public readonly server = Server.create({
    ...this.params,
    router: this.router
  });
}
