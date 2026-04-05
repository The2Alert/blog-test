import type { Readable } from 'node:stream';
import type { PreviewRatio } from '@/adapter/gateway/Post/types';
import { NotFoundError } from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface ReadPreviewParams {
  postId: number;
  ratio: PreviewRatio;
}

export interface ReadPreviewResult {
  stream: Readable;
  mimeType: string;
}

export const ReadPreviewUseCase: UseCaseFunction<
  ReadPreviewParams,
  ReadPreviewResult
> = async ({ repository, gateway, service }, { postId, ratio }) => {
  const post = await repository.post.get({
    where: { id: postId, deleted: false },
    select: { id: true }
  });

  if (!post) {
    throw new NotFoundError({
      code: 'POST_NOT_FOUND',
      message: 'Post not found.'
    });
  }

  const previewPath = await service.post.getPreviewPath({ postId, ratio });
  const exists = await gateway.data.fileExists({ path: previewPath });

  if (!exists) {
    throw new NotFoundError({
      code: 'PREVIEW_NOT_FOUND',
      message: 'Preview not found.'
    });
  }

  const stream = gateway.data.createReadStream({ path: previewPath });

  return { stream, mimeType: 'image/png' };
};
