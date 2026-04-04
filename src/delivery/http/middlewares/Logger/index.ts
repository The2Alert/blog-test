import { NextFunction, Request, Response } from 'express';
import { AbstractMiddleware } from '@/delivery/http/middleware/abstract';

export class LoggerMiddleware extends AbstractMiddleware {
  public middleware(req: Request, res: Response, next: NextFunction): void {
    const { httpLogger } = this;
    const url = req.url;

    httpLogger.log({
      level: 'debug',
      message: `[HTTP Request] ${req.method} ${url} from ${req.ip}`,
      date: new Date()
    });

    res.on('close', () => {
      httpLogger.log({
        level: 'debug',
        message: `[HTTP Response] ${req.method} ${url} ${res.statusCode}`,
        date: new Date()
      });
    });

    return next();
  }
}
