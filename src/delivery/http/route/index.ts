import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodObject, ZodRawShape, ZodType } from 'zod';
import { AbstractRouter } from '@/delivery/http/router/abstract';
import { HttpParams } from '@/delivery/http/types';
import { InvalidDataError } from '@/domain/errors';

export interface RouteMethod {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string | string[];
  handlers: RequestHandler[];
  handler: RequestHandler;
  schema: {
    body?: ZodObject<ZodRawShape>;
    query?: ZodObject<ZodRawShape>;
    params?: ZodObject<ZodRawShape>;
    result?: ZodType;
  };
}

export interface RouteMetadataItem {
  method: 'get' | 'post' | 'put' | 'delete';
  fullPath: string;
  schema: RouteMethod['schema'];
}

export interface RouteParams {
  handlers?: RequestHandler[];
  query?: ZodObject<ZodRawShape>;
  body?: ZodObject<ZodRawShape>;
  params?: ZodObject<ZodRawShape>;
  result?: ZodType;
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
) => any;

export function Route(
  method: RouteMethod['method'],
  path: string | string[],
  {
    handlers = [],
    query: querySchema,
    body: bodySchema,
    params: paramsSchema,
    result: resultSchema
  }: RouteParams = {}
) {
  return function (
    target: AbstractRouter,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> {
    const originalHandler: RouteHandler = descriptor.value;

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
            throw new InvalidDataError({
              errors: error.issues
            });
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
            throw new InvalidDataError({
              errors: error.issues
            });
          }

          body = data;
        } else {
          body = {};
        }

        const headers: Record<string, string | undefined> = {};

        for (const [name, value] of Object.entries(req.headers)) {
          let headerValue: string;

          if (typeof value === 'string') {
            headerValue = value;
          } else if (Array.isArray(value)) {
            headerValue = value.join(', ');
          } else {
            continue;
          }

          headers[name] = headerValue;
        }

        let params: Record<string, unknown>;
        if (paramsSchema) {
          const { success, error, data } = await paramsSchema.safeParseAsync(
            req.params
          );

          if (!success) {
            throw new InvalidDataError({
              errors: error.issues
            });
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
      schema: {
        query: querySchema,
        body: bodySchema,
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
