import { RouteHandler } from '@/delivery/http/route';
import { AbstractRouter } from '@/delivery/http/router/abstract';
import { TooManyRequestsError } from '@/domain/errors';

export interface RateLimitDecoratorParams {
  windowMs: number;
  max: number;
}

export function RateLimit({ windowMs, max }: RateLimitDecoratorParams) {
  return function (
    target: AbstractRouter,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> {
    const originalHandler: RouteHandler = descriptor.value;

    const handler: RouteHandler = async function (params) {
      const { useCase, ip, req } = params;
      const routeKey = `${req.method}:${req.path}`;
      const resolvedIp = ip !== null ? ip : 'unknown';

      const { allowed } = await useCase.rateLimit.check({
        ip: resolvedIp,
        routeKey,
        windowMs,
        max
      });

      if (!allowed) {
        throw new TooManyRequestsError();
      }

      return await originalHandler.call(this, params);
    };

    descriptor.value = handler;
    return descriptor;
  };
}
