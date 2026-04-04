import { readFile, readdir, stat } from 'node:fs/promises';
import process from 'node:process';
import path from 'path';
import YAML from 'yaml';
import z from 'zod';
import { ConfigFile, ConfigParseParams, PlainObject } from './types';

export class ConfigParser {
  private static readonly CONFIG_MAIN_FILENAME = 'config.yml';
  private static readonly CONFIG_ADDITIONAL_PREFIX = 'config.';
  private static readonly CONFIG_ADDITIONAL_SUFFIX = '.yml';
  private static readonly LOCAL_CONFIG_FILENAME = 'config.local.yml';

  private static isPlainObject(value: unknown): value is PlainObject {
    if (value === null) {
      return false;
    }

    if (Array.isArray(value)) {
      return false;
    }

    return typeof value === 'object';
  }

  private static async readConfigFile(filePath: string): Promise<PlainObject> {
    try {
      const configContent = await readFile(filePath, 'utf-8');
      const parsed = YAML.parse(configContent);

      if (this.isPlainObject(parsed)) {
        return parsed;
      }

      return {};
    } catch {
      return {};
    }
  }

  private static deepMerge(
    target: PlainObject,
    source: PlainObject
  ): PlainObject {
    const result: PlainObject = { ...target };

    for (const [key, sourceValue] of Object.entries(source)) {
      const targetValue = result[key];

      if (this.isPlainObject(targetValue) && this.isPlainObject(sourceValue)) {
        result[key] = this.deepMerge(targetValue, sourceValue);
        continue;
      }

      result[key] = sourceValue;
    }

    return result;
  }

  private static async collectConfigFilesRecursively(
    dirPath: string,
    basePath: string
  ): Promise<ConfigFile[]> {
    const configFiles: ConfigFile[] = [];

    let entries: string[];

    try {
      entries = await readdir(dirPath);
    } catch {
      return [];
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const relativePath = path.relative(basePath, fullPath);

      let stats;

      try {
        stats = await stat(fullPath);
      } catch {
        continue;
      }

      if (stats.isDirectory()) {
        const nestedFiles = await this.collectConfigFilesRecursively(
          fullPath,
          basePath
        );
        configFiles.push(...nestedFiles);
        continue;
      }

      if (!stats.isFile()) {
        continue;
      }

      if (entry === this.CONFIG_MAIN_FILENAME) {
        configFiles.push({
          path: relativePath,
          type: 'main',
          order: 0
        });
        continue;
      }

      if (entry === this.LOCAL_CONFIG_FILENAME) {
        configFiles.push({
          path: relativePath,
          type: 'local',
          order: 2
        });
        continue;
      }

      if (
        entry.startsWith(this.CONFIG_ADDITIONAL_PREFIX) &&
        entry.endsWith(this.CONFIG_ADDITIONAL_SUFFIX) &&
        entry !== this.LOCAL_CONFIG_FILENAME
      ) {
        configFiles.push({
          path: relativePath,
          type: 'additional',
          order: 1
        });
      }
    }

    return configFiles;
  }

  private static sortConfigFiles(files: ConfigFile[]): ConfigFile[] {
    return files.sort((fileA, fileB) => {
      if (fileA.order !== fileB.order) {
        return fileA.order - fileB.order;
      }

      return fileA.path.localeCompare(fileB.path);
    });
  }

  public static async parse<Schema extends z.ZodObject = z.ZodObject>({
    schema
  }: ConfigParseParams<Schema>): Promise<z.infer<Schema>> {
    const configPath = path.resolve(process.cwd(), './config');
    const mainConfigPath = path.join(configPath, this.CONFIG_MAIN_FILENAME);

    const mainConfig = await this.readConfigFile(mainConfigPath);

    if (Object.keys(mainConfig).length === 0) {
      throw new Error('Main config file not found.');
    }

    const allConfigFiles = await this.collectConfigFilesRecursively(
      configPath,
      configPath
    );

    const sortedFiles = this.sortConfigFiles(allConfigFiles);

    let mergedConfig: PlainObject = {};

    for (const configFile of sortedFiles) {
      const filePath = path.join(configPath, configFile.path);
      const configPart = await this.readConfigFile(filePath);
      mergedConfig = this.deepMerge(mergedConfig, configPart);
    }

    const parsed = await schema.safeParseAsync(mergedConfig);

    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error));
    }

    return parsed.data;
  }
}
