import z from 'zod';

export type PlainObject = Record<string, unknown>;

export type ConfigParseParams<Schema extends z.ZodObject = z.ZodObject> = {
  schema: Schema;
};

export interface ConfigFile {
  path: string;
  type: 'main' | 'additional' | 'local';
  order: number;
}
