import { ErrorHandlerMiddleware } from './ErrorHandler';
import { LoggerMiddleware } from './Logger';
import { MiddlewareParams } from './types';

export class MiddlewareManager {
  public static create(params: MiddlewareParams) {
    return {
      errorHandlerMiddleware: new ErrorHandlerMiddleware(params).bind(),
      loggerMiddleware: new LoggerMiddleware(params).bind()
    };
  }
}

export type Middlewares = ReturnType<(typeof MiddlewareManager)['create']>;
