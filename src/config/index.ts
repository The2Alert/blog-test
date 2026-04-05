import { z } from 'zod';

export const configSchema = z.object({
  logger: z
    .object({
      level: z.enum(['debug', 'info', 'error'])
    })
    .default({ level: 'debug' }),
  http: z.object({
    host: z.string(),
    port: z.number(),
    baseUrl: z.string()
  }),
  postgres: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    db: z.string()
  }),
  redis: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string()
  }),
  admin: z.object({
    id: z.number(),
    login: z.string(),
    password: z.string()
  }),
  jwt: z.object({
    secret: z.string()
  })
});

export type Config = z.infer<typeof configSchema>;

export { ConfigParser } from './Parser';
