export interface BaseErrorParams {
  message?: string;
  data?: object;
  code?: string;
  httpStatus?: number;
  errors?: object[];
}

export class BaseError extends Error {
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
  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({
      message: message ?? 'Not found.',
      ...params
    });
  }
}

export class ForbiddenError extends BaseError {
  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({
      message: message ?? 'Forbidden.',
      ...params
    });
  }
}

export class UnauthorizedError extends BaseError {
  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({
      message: message ?? 'Unauthorized.',
      ...params
    });
  }
}

export class InvalidDataError extends BaseError {
  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({
      message: message ?? 'Invalid data.',
      ...params
    });
  }
}

export class InternalError extends BaseError {
  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({
      message: message ?? 'Internal error.',
      ...params
    });
  }
}

export class EntityTooLargeError extends BaseError {
  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({
      message: message ?? 'Entity too large.',
      ...params
    });
  }
}

export class TooManyRequestsError extends BaseError {
  constructor({ message, ...params }: BaseErrorParams = {}) {
    super({
      message: message ?? 'Too many requests.',
      ...params,
      httpStatus: 429
    });
  }
}
