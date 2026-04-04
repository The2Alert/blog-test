import { File as PrismaFile } from '@prisma/client';

export interface File extends PrismaFile {}

export { FileStatus, FileType } from '@prisma/client';
export { fileSchema } from './schema';
