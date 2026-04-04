import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';
import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { MiddlewareParams } from '@/delivery/http/types';
import type { UseCase } from '@/domain/usecase';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';

export abstract class AbstractMiddleware {
  protected readonly appInfo: AppInfo;
  protected readonly config: Config;
  protected readonly lib: Lib;
  protected readonly clients: Clients;
  protected readonly logger: Logger;
  protected readonly useCase: UseCase;
  protected readonly httpLogger: Logger;

  constructor(protected readonly params: MiddlewareParams) {
    this.appInfo = params.appInfo;
    this.config = params.config;
    this.lib = params.lib;
    this.clients = params.clients;
    this.logger = params.logger;
    this.useCase = params.useCase;
    this.httpLogger = params.httpLogger;
  }

  public abstract middleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): unknown | Promise<unknown>;

  public bind(): RequestHandler {
    return this.middleware.bind(this);
  }
}

export abstract class AbstractErrorMiddleware {
  protected readonly appInfo: AppInfo;
  protected readonly config: Config;
  protected readonly lib: Lib;
  protected readonly clients: Clients;
  protected readonly logger: Logger;
  protected readonly useCase: UseCase;
  protected readonly httpLogger: Logger;

  constructor(protected readonly params: MiddlewareParams) {
    this.appInfo = params.appInfo;
    this.config = params.config;
    this.lib = params.lib;
    this.clients = params.clients;
    this.logger = params.logger;
    this.useCase = params.useCase;
    this.httpLogger = params.httpLogger;
  }

  public abstract middleware(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): unknown | Promise<unknown>;

  public bind(): ErrorRequestHandler {
    return this.middleware.bind(this);
  }
}
