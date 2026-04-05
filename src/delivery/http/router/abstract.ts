import { Router as ExpressRouter } from 'express';
import type { AppInfo } from '@/app/types';
import type { Config } from '@/config';
import type { RouteMetadataItem, RouteMethod } from '@/delivery/http/route';
import type { UseCase } from '@/domain/usecase';
import type { Lib } from '@/lib';
import type { Clients } from '@/lib/clients';
import type { Logger } from '@/lib/logger';
import type { RouterParams } from './types';

export abstract class AbstractRouter {
  protected readonly appInfo: AppInfo;
  protected readonly config: Config;
  protected readonly lib: Lib;
  protected readonly clients: Clients;
  protected readonly logger: Logger;
  protected readonly useCase: UseCase;
  protected readonly httpLogger: Logger;

  declare public readonly path: string;
  declare public readonly routerName: string;
  declare public routes: RouteMethod[];

  public readonly children: AbstractRouter[] = [];
  public readonly router = ExpressRouter();

  constructor(public readonly params: RouterParams) {
    this.appInfo = params.appInfo;
    this.config = params.config;
    this.lib = params.lib;
    this.clients = params.clients;
    this.logger = params.logger;
    this.useCase = params.useCase;
    this.httpLogger = params.httpLogger;

    this.path ??= '/';
    this.routes ??= [];
  }

  public collectAllRouteMetadata(prefix: string): RouteMetadataItem[] {
    const fullRouterPath = prefix + this.path;

    const metadataItems: RouteMetadataItem[] = this.routes.map(
      (routeMethod) => {
        const routePath = Array.isArray(routeMethod.path)
          ? routeMethod.path[0]
          : routeMethod.path;

        return {
          method: routeMethod.method,
          fullPath: fullRouterPath + routePath,
          schema: routeMethod.schema,
          errors: routeMethod.errors,
          routerName: this.routerName
        };
      }
    );

    for (const childRouter of this.children) {
      metadataItems.push(
        ...childRouter.collectAllRouteMetadata(fullRouterPath)
      );
    }

    return metadataItems;
  }

  public registerRoutes(parentRouter: ExpressRouter): void {
    for (const { method, path, handlers, handler } of this.routes) {
      this.router[method](path, ...handlers, handler.bind(this));
    }

    parentRouter.use(this.path, this.router);

    for (const childRouter of this.children) {
      childRouter.registerRoutes(this.router);
    }
  }
}
