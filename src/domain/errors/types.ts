import type { ZodType } from 'zod';
import type { BaseError } from '.';

export interface ErrorConstructor {
  new (...args: never[]): BaseError;
  readonly httpStatus: number;

  getSchema(): ZodType;
}
