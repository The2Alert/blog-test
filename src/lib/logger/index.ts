import { join } from 'node:path';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { LoggerParams } from './types';

export class Logger extends winston.Logger {
  public static create({
    level,
    files = true,
    dataPath = null
  }: LoggerParams): Logger {
    return winston.createLogger({
      level,
      transports: [
        new winston.transports.Console(),
        ...(files && !!dataPath
          ? [
              new winston.transports.DailyRotateFile({
                filename: '%DATE%.log',
                dirname: join(dataPath, './Log'),
                maxFiles: '7d'
              })
            ]
          : [])
      ],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    });
  }
}
