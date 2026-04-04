import express, { Router as ExpressRouter } from 'express';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { ZodObject, ZodRawShape } from 'zod';
import { createDocument } from 'zod-openapi';
import type { RouteMetadataItem } from '@/delivery/http/route';
import { AuthRouter } from './Auth';
import { UserRouter } from './User';
import { AbstractRouter } from './abstract';
import { Router } from './decorator';

@Router('/api/v1')
export class ApiRouter extends AbstractRouter {
  public readonly children = [
    new AuthRouter(this.params),
    new UserRouter(this.params)
  ];

  private buildOpenApiDocument(): Record<string, unknown> {
    const allRoutes: RouteMetadataItem[] = [];

    for (const childRouter of this.children) {
      allRoutes.push(...childRouter.collectAllRouteMetadata(''));
    }

    const paths: Record<string, Record<string, unknown>> = {};

    for (const routeItem of allRoutes) {
      const openApiPath = routeItem.fullPath.replace(/:([^/]+)/g, '{$1}');

      if (!paths[openApiPath]) {
        paths[openApiPath] = {};
      }

      const requestParamsEntry: Record<string, ZodObject<ZodRawShape>> = {};

      if (routeItem.schema.params) {
        requestParamsEntry['path'] = routeItem.schema.params;
      }

      if (routeItem.schema.query) {
        requestParamsEntry['query'] = routeItem.schema.query;
      }

      const hasRequestParams = Object.keys(requestParamsEntry).length > 0;

      const response200: Record<string, unknown> = {
        description: '200 OK'
      };

      if (routeItem.schema.result) {
        response200['content'] = {
          'application/json': { schema: routeItem.schema.result }
        };
      }

      const operation: Record<string, unknown> = {
        responses: { '200': response200 }
      };

      if (hasRequestParams) {
        operation['requestParams'] = requestParamsEntry;
      }

      if (routeItem.schema.body) {
        operation['requestBody'] = {
          content: {
            'application/json': { schema: routeItem.schema.body }
          }
        };
      }

      paths[openApiPath][routeItem.method] = operation;
    }

    return createDocument({
      openapi: '3.1.0',
      info: {
        title: this.appInfo.name,
        version: this.appInfo.version
      },
      servers: [{ url: `${this.config.http.baseUrl}/api/v1` }],
      paths: paths as Parameters<typeof createDocument>[0]['paths']
    }) as unknown as Record<string, unknown>;
  }

  public registerRoutes(parentRouter: ExpressRouter): void {
    const { errorHandlerMiddleware, loggerMiddleware } = this.params;
    const { router } = this;
    const openApiDocument = this.buildOpenApiDocument();

    router.use(loggerMiddleware);
    router.use(cors());
    router.use(express.json());
    router.use(cookieParser());
    router.use(
      '/docs',
      // @ts-ignore
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument, {
        swaggerOptions: { persistAuthorization: true }
      })
    );

    super.registerRoutes(parentRouter);

    parentRouter.use(errorHandlerMiddleware);
  }
}

export * from './decorator';
