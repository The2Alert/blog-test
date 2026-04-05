import { PostUserRole } from '@/domain/entity/PostUser';
import { ForbiddenError, NotFoundError } from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface DeletePostParams {
  postId: number;
  userId: number;
}

export const DeletePostUseCase: UseCaseFunction<DeletePostParams> = async (
  { repository },
  { postId, userId }
) => {
  const [post, postUser] = await Promise.all([
    repository.post.get({
      where: { id: postId, deleted: false }
    }),
    repository.postUser.get({
      where: {
        postId,
        userId,
        role: PostUserRole.EDITOR,
        user: { banned: false }
      }
    })
  ]);

  if (!post) {
    throw new NotFoundError({
      code: 'POST_NOT_FOUND',
      message: 'Post not found.'
    });
  }
  if (!postUser) {
    throw new ForbiddenError({
      code: 'POST_FORBIDDEN',
      message: 'Access denied.'
    });
  }

  await repository.post.update({
    where: { id: postId },
    data: { deleted: true }
  });
};
