import express, { Router as ExpressRouter } from 'express';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ZodObject, ZodRawShape, ZodType } from 'zod';
import { createDocument } from 'zod-openapi';
import type { RouteMetadataItem } from '@/delivery/http/route';
import { fileSchema } from '@/domain/entity/File/schema';
import { postSchema } from '@/domain/entity/Post/schema';
import { postTagSchema } from '@/domain/entity/PostTag/schema';
import { postUserSchema } from '@/domain/entity/PostUser/schema';
import { tagSchema } from '@/domain/entity/Tag/schema';
import { userSchema } from '@/domain/entity/User/schema';
import {
  EntityTooLargeError,
  ForbiddenError,
  InternalError,
  InvalidDataError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  errorSchema
} from '@/domain/errors';
import { AuthRouter } from './Auth';
import { PostRouter } from './Post';
import { UserRouter } from './User';
import { AbstractRouter } from './abstract';
import { Router } from './decorator';

@Router('/api/v1')
export class ApiRouter extends AbstractRouter {
  public readonly children = [
    new AuthRouter(this.params),
    new UserRouter(this.params),
    new PostRouter(this.params)
  ];

  private buildOpenApiDocument(): Record<string, unknown> {
    const allRoutes: RouteMetadataItem[] = [];

    for (const childRouter of this.children) {
      allRoutes.push(...childRouter.collectAllRouteMetadata(''));
    }

    const paths: Record<string, Record<string, unknown>> = {};

    for (const routeItem of allRoutes) {
      const openApiPath = routeItem.fullPath.replace(/:([^/.]+)/g, '{$1}');

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

      const response200: Record<string, unknown> = { description: '200 OK' };

      if (routeItem.schema.result) {
        response200['content'] = {
          'application/json': { schema: routeItem.schema.result }
        };
      }

      const responses: Record<string, unknown> = { '200': response200 };

      const errors = routeItem.errors ?? [
        InvalidDataError,
        UnauthorizedError,
        ForbiddenError,
        NotFoundError,
        EntityTooLargeError,
        TooManyRequestsError,
        InternalError
      ];

      for (const errorClass of errors) {
        const status = String(errorClass.httpStatus);

        responses[status] = {
          description: `${errorClass.httpStatus} ${errorClass.name}`,
          content: {
            'application/json': { schema: errorClass.getSchema() }
          }
        };
      }

      const operation: Record<string, unknown> = { responses };

      operation['tags'] = [routeItem.routerName];

      if (hasRequestParams) {
        operation['requestParams'] = requestParamsEntry;
      }

      if (routeItem.schema.body) {
        const bodyContentType =
          routeItem.schema.bodyContentType ?? 'application/json';

        operation['requestBody'] = {
          content: {
            [bodyContentType]: { schema: routeItem.schema.body }
          }
        };
      }

      operation['security'] = [{ bearerAuth: [] }];

      paths[openApiPath][routeItem.method] = operation;
    }

    return createDocument(
      {
        openapi: '3.1.0',
        info: {
          title: this.appInfo.name,
          version: this.appInfo.version
        },
        servers: [{ url: `${this.config.http.baseUrl}/api/v1` }],
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          },
          schemas: {
            User: userSchema as unknown as ZodType,
            File: fileSchema as unknown as ZodType,
            Post: postSchema as unknown as ZodType,
            Tag: tagSchema as unknown as ZodType,
            PostUser: postUserSchema as unknown as ZodType,
            PostTag: postTagSchema as unknown as ZodType,
            Error: errorSchema as unknown as ZodType
          }
        },
        paths: paths as Parameters<typeof createDocument>[0]['paths']
      },
      { outputIdSuffix: '' }
    ) as unknown as Record<string, unknown>;
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
