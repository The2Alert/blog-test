import { RouteHandler } from '@/delivery/http/route';
import { AbstractRouter } from '@/delivery/http/router/abstract';
import { UnauthorizedError } from '@/domain/errors';

export type AuthMethod = (this: AbstractRouter, ...args: any[]) => any;

export interface AuthParams {
  required?: boolean;
  adminOnly?: boolean;
}

export function Auth({ required = false, adminOnly = false }: AuthParams = {}) {
  return function (
    target: AbstractRouter,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> {
    const originalHandler: RouteHandler = descriptor.value;

    const handler: RouteHandler = async function (params) {
      const { useCase } = this;

      try {
        const { req } = params;

        let token: string | null;

        if (typeof req.headers.authorization === 'string') {
          token = req.headers.authorization.split(' ')[1];
        } else {
          token = null;
        }

        const { userId } = await useCase.auth.verify({
          token,
          adminOnly
        });

        return await originalHandler.call(this, {
          ...params,
          userId
        });
      } catch (error) {
        if (error instanceof UnauthorizedError && !required) {
          return await originalHandler.call(this, params);
        }

        throw error;
      }
    };

    descriptor.value = handler;

    return descriptor;
  };
}
