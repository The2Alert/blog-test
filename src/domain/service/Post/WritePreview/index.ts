import { ServiceFunction } from '@/domain/service/types';

export interface WritePreviewParams {
  postId: number;
  buffer: Buffer;
}

export interface WritePreviewResult {
  '1x1': {
    path: string;
    mimeType: string;
    width: number;
    height: number;
    size: number;
    buffer: Buffer;
  };
  '4x3': {
    path: string;
    mimeType: string;
    width: number;
    height: number;
    size: number;
    buffer: Buffer;
  };
  '16x9': {
    path: string;
    mimeType: string;
    width: number;
    height: number;
    size: number;
    buffer: Buffer;
  };
}

export const WritePreviewService: ServiceFunction<
  WritePreviewParams,
  WritePreviewResult
> = async ({ gateway, service }, { postId, buffer }) => {
  const previews = await gateway.post.processPreview({ buffer });

  const [preview1x1Path, preview4x3Path, preview16x9Path] = await Promise.all([
    service.post.getPreviewPath({ postId, ratio: '1x1' }),
    service.post.getPreviewPath({ postId, ratio: '4x3' }),
    service.post.getPreviewPath({ postId, ratio: '16x9' })
  ]);

  await Promise.all([
    gateway.data.writeFile({
      path: preview1x1Path,
      content: previews['1x1'].buffer
    }),
    gateway.data.writeFile({
      path: preview4x3Path,
      content: previews['4x3'].buffer
    }),
    gateway.data.writeFile({
      path: preview16x9Path,
      content: previews['16x9'].buffer
    })
  ]);

  return {
    '1x1': {
      ...previews['1x1'],
      path: preview1x1Path
    },
    '4x3': {
      ...previews['4x3'],
      path: preview4x3Path
    },
    '16x9': {
      ...previews['16x9'],
      path: preview16x9Path
    }
  };
};
