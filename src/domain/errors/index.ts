import type { ZodType } from 'zod';
import { errorSchema } from './schema';

export type { ErrorConstructor } from './types';

export interface BaseErrorParams {
  message?: string;
  data?: object;
  code?: string;
  httpStatus?: number;
  errors?: object[];
}

export class BaseError extends Error {
  public static readonly httpStatus: number = 500;
  public static getSchema(): ZodType {
    return errorSchema;
  }

  public readonly message: string;
  public readonly data?: object;
  public readonly code?: string;
  public readonly httpStatus?: number;
  public readonly errors?: object[];

  constructor({
    message,
    data,
    code,
    httpStatus,
    errors
  }: BaseErrorParams = {}) {
    super(message);
    this.message = message ?? 'Base error.';
    this.data = data;
    this.code = code;
    this.httpStatus = httpStatus;
    this.errors = errors;
  }
}

export class NotFoundError extends BaseError {
  public static readonly httpStatus = 404;
  public static getSchema(): ZodType {
    return errorSchema;
  }

  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({ message: message ?? 'Not found.', ...params });
  }
}

export class ForbiddenError extends BaseError {
  public static readonly httpStatus = 403;
  public static getSchema(): ZodType {
    return errorSchema;
  }

  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({ message: message ?? 'Forbidden.', ...params });
  }
}

export class UnauthorizedError extends BaseError {
  public static readonly httpStatus = 401;
  public static getSchema(): ZodType {
    return errorSchema;
  }

  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({ message: message ?? 'Unauthorized.', ...params });
  }
}

export class InvalidDataError extends BaseError {
  public static readonly httpStatus = 400;
  public static getSchema(): ZodType {
    return errorSchema;
  }

  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({ message: message ?? 'Invalid data.', ...params });
  }
}

export class InternalError extends BaseError {
  public static readonly httpStatus = 500;
  public static getSchema(): ZodType {
    return errorSchema;
  }

  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({ message: message ?? 'Internal error.', ...params });
  }
}

export class EntityTooLargeError extends BaseError {
  public static readonly httpStatus = 413;
  public static getSchema(): ZodType {
    return errorSchema;
  }

  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({ message: message ?? 'Entity too large.', ...params });
  }
}

export class TooManyRequestsError extends BaseError {
  public static readonly httpStatus = 429;
  public static getSchema(): ZodType {
    return errorSchema;
  }

  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({
      message: message ?? 'Too many requests.',
      ...params,
      httpStatus: 429
    });
  }
}

export { errorSchema } from './schema';
