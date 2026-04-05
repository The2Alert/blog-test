import type { PreviewRatio } from '@/adapter/gateway/Post/types';
import { ServiceFunction } from '@/domain/service/types';

export interface GetPreviewPathParams {
  postId: number;
  ratio: PreviewRatio;
}

export const GetPreviewPathService: ServiceFunction<
  GetPreviewPathParams,
  string
> = async (_, { postId, ratio }) => `Post/${postId}/preview${ratio}.png`;
