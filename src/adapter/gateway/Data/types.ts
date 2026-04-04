export interface WriteFileParams {
  path: string;
  content: string | Buffer;
}

export interface ReadFileParams {
  path: string;
}

export interface ReadFileResult {
  content: Buffer;
  exists: boolean;
}

export interface ReadFileStreamParams {
  path: string;
}

export interface FileExistsParams {
  path: string;
}

export interface EnsureDirectoryParams {
  path: string;
}

export interface ListFilesParams {
  path: string;
  pattern?: string;
}

export interface DeleteFileParams {
  path: string;
}

export interface RenameDirectoryParams {
  oldPath: string;
  newPath: string;
}

export interface DeleteDirectoryParams {
  path: string;
}
