import { Post } from '@/domain/entity/Post';
import { NotFoundError } from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface GetByIdOrSlugParams {
  idOrSlug: string;
}

export interface GetByIdOrSlugResult {
  post: Post;
}

export const GetByIdOrSlugUseCase: UseCaseFunction<
  GetByIdOrSlugParams,
  GetByIdOrSlugResult
> = async ({ repository }, { idOrSlug }) => {
  const numericId = Number(idOrSlug);
  const isId = Number.isInteger(numericId) && String(numericId) === idOrSlug;

  const post = await repository.post.get({
    where: {
      ...(isId && { id: numericId }),
      ...(!isId && { slug: idOrSlug }),
      deleted: false
    },
    select: 'item'
  });

  if (!post) {
    throw new NotFoundError({
      code: 'POST_NOT_FOUND',
      message: 'Post not found.'
    });
  }

  return { post };
};
