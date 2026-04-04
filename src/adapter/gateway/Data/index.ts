import { createReadStream } from 'node:fs';
import type { Readable } from 'node:stream';
import path from 'path';
import { AbstractGateway } from '@/adapter/gateway/abstract';
import {
  DeleteDirectoryParams,
  DeleteFileParams,
  EnsureDirectoryParams,
  FileExistsParams,
  ListFilesParams,
  ReadFileParams,
  ReadFileResult,
  ReadFileStreamParams,
  RenameDirectoryParams,
  WriteFileParams
} from './types';

export class DataGateway extends AbstractGateway {
  private readonly dataPath = this.appInfo.dataPath;

  private readonly fs = this.lib.fs;

  private resolvePath(filePath: string): string {
    return path.join(this.dataPath, filePath);
  }

  public async ensureDirectory({
    path: dirPath
  }: EnsureDirectoryParams): Promise<void> {
    const { fs } = this;
    const fullPath = this.resolvePath(dirPath);

    await fs.mkdir(fullPath, { recursive: true });
  }

  public async writeFile({
    path: filePath,
    content
  }: WriteFileParams): Promise<void> {
    const { fs } = this;
    const fullPath = this.resolvePath(filePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  public async readFile({
    path: filePath
  }: ReadFileParams): Promise<ReadFileResult> {
    const { fs } = this;
    const fullPath = this.resolvePath(filePath);

    try {
      const content = await fs.readFile(fullPath);

      return { content, exists: true };
    } catch {
      return { content: Buffer.from(''), exists: false };
    }
  }

  public createReadStream({ path: filePath }: ReadFileStreamParams): Readable {
    const fullPath = this.resolvePath(filePath);

    return createReadStream(fullPath);
  }

  public async fileExists({
    path: filePath
  }: FileExistsParams): Promise<boolean> {
    const { fs } = this;
    const fullPath = this.resolvePath(filePath);

    try {
      await fs.access(fullPath);

      return true;
    } catch {
      return false;
    }
  }

  public async listFiles({
    path: dirPath,
    pattern
  }: ListFilesParams): Promise<string[]> {
    const { fs } = this;
    const fullPath = this.resolvePath(dirPath);

    try {
      const files = await fs.readdir(fullPath);

      if (pattern) {
        const regex = new RegExp(pattern);

        return files.filter((file) => regex.test(file));
      }

      return files;
    } catch {
      return [];
    }
  }

  public async deleteFile({
    path: filePath
  }: DeleteFileParams): Promise<boolean> {
    const { fs } = this;
    const fullPath = this.resolvePath(filePath);

    try {
      await fs.unlink(fullPath);

      return true;
    } catch {
      return false;
    }
  }

  public async renameDirectory({
    oldPath,
    newPath
  }: RenameDirectoryParams): Promise<boolean> {
    const { fs } = this;
    const fullOldPath = this.resolvePath(oldPath);
    const fullNewPath = this.resolvePath(newPath);

    try {
      await fs.rename(fullOldPath, fullNewPath);

      return true;
    } catch {
      return false;
    }
  }

  public async deleteDirectory({
    path: dirPath
  }: DeleteDirectoryParams): Promise<boolean> {
    const { fs } = this;
    const fullPath = this.resolvePath(dirPath);

    try {
      await fs.rm(fullPath, { recursive: true, force: true });

      return true;
    } catch {
      return false;
    }
  }
}
