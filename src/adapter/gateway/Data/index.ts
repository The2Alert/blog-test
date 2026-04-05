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
    await this.fs.mkdir(this.resolvePath(dirPath), { recursive: true });
  }

  public async writeFile({
    path: filePath,
    content
  }: WriteFileParams): Promise<void> {
    const fullPath = this.resolvePath(filePath);

    await this.fs.mkdir(path.dirname(fullPath), { recursive: true });

    if (Buffer.isBuffer(content)) {
      await this.fs.writeFile(fullPath, content);
    } else {
      await this.fs.writeFile(fullPath, content, 'utf-8');
    }
  }

  public async readFile({
    path: filePath
  }: ReadFileParams): Promise<ReadFileResult> {
    try {
      const content = await this.fs.readFile(this.resolvePath(filePath));

      return { content, exists: true };
    } catch {
      return { content: Buffer.from(''), exists: false };
    }
  }

  public createReadStream({ path: filePath }: ReadFileStreamParams): Readable {
    return createReadStream(this.resolvePath(filePath));
  }

  public async fileExists({
    path: filePath
  }: FileExistsParams): Promise<boolean> {
    try {
      await this.fs.access(this.resolvePath(filePath));

      return true;
    } catch {
      return false;
    }
  }

  public async listFiles({
    path: dirPath,
    pattern
  }: ListFilesParams): Promise<string[]> {
    try {
      const files = await this.fs.readdir(this.resolvePath(dirPath));

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
    try {
      await this.fs.unlink(this.resolvePath(filePath));

      return true;
    } catch {
      return false;
    }
  }

  public async renameDirectory({
    oldPath,
    newPath
  }: RenameDirectoryParams): Promise<boolean> {
    try {
      await this.fs.rename(
        this.resolvePath(oldPath),
        this.resolvePath(newPath)
      );

      return true;
    } catch {
      return false;
    }
  }

  public async deleteDirectory({
    path: dirPath
  }: DeleteDirectoryParams): Promise<boolean> {
    try {
      await this.fs.rm(this.resolvePath(dirPath), {
        recursive: true,
        force: true
      });

      return true;
    } catch {
      return false;
    }
  }
}
