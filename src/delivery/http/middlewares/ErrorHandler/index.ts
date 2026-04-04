import { NextFunction, Request, Response } from 'express';
import { HttpError } from '@/delivery/http/error';
import { AbstractErrorMiddleware } from '@/delivery/http/middleware/abstract';

export class ErrorHandlerMiddleware extends AbstractErrorMiddleware {
  public middleware(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Response {
    const { httpLogger } = this;
    const httpError = new HttpError(error);

    if (!httpError.isKnownError) {
      httpLogger.log({
        level: 'error',
        message: error.stack || 'No stack provided.'
      });
    }

    return res.status(httpError.statusCode).json({
      status: 'error',
      error: httpError.getError()
    });
  }
}
