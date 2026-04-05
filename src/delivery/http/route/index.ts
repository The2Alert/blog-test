import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodObject, ZodRawShape, ZodType } from 'zod';
import { AbstractRouter } from '@/delivery/http/router/abstract';
import { HttpParams } from '@/delivery/http/types';
import { InvalidDataError } from '@/domain/errors';
import type { ErrorConstructor } from '@/domain/errors/types';

export interface RouteMethod {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string | string[];
  handlers: RequestHandler[];
  handler: RequestHandler;
  schema: {
    body?: ZodObject<ZodRawShape>;
    bodyContentType?: string;
    query?: ZodObject<ZodRawShape>;
    params?: ZodObject<ZodRawShape>;
    result?: ZodType;
  };
  errors?: ErrorConstructor[];
}

export interface RouteMetadataItem {
  method: 'get' | 'post' | 'put' | 'delete';
  fullPath: string;
  schema: RouteMethod['schema'];
  errors?: ErrorConstructor[];
  routerName: string;
}

export interface RouteParams {
  handlers?: RequestHandler[];
  query?: ZodObject<ZodRawShape>;
  body?: ZodObject<ZodRawShape>;
  bodyContentType?: string;
  params?: ZodObject<ZodRawShape>;
  result?: ZodType;
  errors?: ErrorConstructor[];
}

export interface RouteHandlerParams<
  QueryOrBody extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>,
  Params extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>
> extends HttpParams {
  req: Request;
  res: Response;
  next: NextFunction;
  query: import('zod').infer<QueryOrBody>;
  body: import('zod').infer<QueryOrBody>;
  headers: Record<string, string | undefined>;
  params: import('zod').infer<Params>;
  userId: number;
  userAgent: string | null;
  ip: string | null;
  language: string | null;
}

export type RouteHandler = (
  this: AbstractRouter,
  params: RouteHandlerParams
) => unknown;

export function Route(
  method: RouteMethod['method'],
  path: string | string[],
  {
    handlers = [],
    query: querySchema,
    body: bodySchema,
    bodyContentType,
    params: paramsSchema,
    result: resultSchema,
    errors
  }: RouteParams = {}
) {
  return function (
    target: AbstractRouter,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> {
    const originalHandler: RouteHandler = descriptor.value!;

    const handler: RequestHandler = async function (
      this: AbstractRouter,
      req,
      res,
      next
    ) {
      try {
        let query: Record<string, unknown>;

        if (querySchema) {
          const { success, error, data } = await querySchema.safeParseAsync(
            req.query
          );

          if (!success) {
            throw new InvalidDataError({ errors: error.issues });
          }

          query = data;
        } else {
          query = {};
        }

        let body: Record<string, unknown>;

        if (bodySchema) {
          const { success, error, data } = await bodySchema.safeParseAsync(
            req.body
          );

          if (!success) {
            throw new InvalidDataError({ errors: error.issues });
          }

          body = data;
        } else {
          body = {};
        }

        const headers: Record<string, string | undefined> = {};

        for (const [name, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') {
            headers[name] = value;
          } else if (Array.isArray(value)) {
            headers[name] = value.join(', ');
          }
        }

        let params: Record<string, unknown>;

        if (paramsSchema) {
          const { success, error, data } = await paramsSchema.safeParseAsync(
            req.params
          );

          if (!success) {
            throw new InvalidDataError({ errors: error.issues });
          }

          params = data;
        } else {
          params = {};
        }

        const userAgent = headers['user-agent'] ?? null;
        const ip = headers['x-real-ip'] ?? req.ip ?? null;
        const language = headers['accept-language'] ?? null;

        return await originalHandler.call(this, {
          ...this.params,
          req,
          res,
          next,
          query,
          body,
          headers,
          params,
          userId: -1,
          userAgent,
          ip,
          language
        });
      } catch (error) {
        if (next instanceof Function) {
          return next(error);
        }
      }
    };

    descriptor.value = handler;

    target.routes ??= [];
    target.routes.push({
      method,
      path,
      handlers,
      handler,
      errors,
      schema: {
        query: querySchema,
        body: bodySchema,
        bodyContentType,
        params: paramsSchema,
        result: resultSchema
      }
    });

    return descriptor;
  };
}

export type RouteDecorator = ReturnType<typeof Route>;

export function Get(path: string | string[], params?: RouteParams) {
  return Route('get', path, params);
}

export function Post(path: string | string[], params?: RouteParams) {
  return Route('post', path, params);
}

export function Put(path: string | string[], params?: RouteParams) {
  return Route('put', path, params);
}

export function Delete(path: string | string[], params?: RouteParams) {
  return Route('delete', path, params);
}
