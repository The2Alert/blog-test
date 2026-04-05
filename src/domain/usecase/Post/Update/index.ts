import { Post } from '@/domain/entity/Post';
import { PostUserRole } from '@/domain/entity/PostUser';
import {
  ForbiddenError,
  InvalidDataError,
  NotFoundError
} from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface UpdateParams {
  postId: number;
  userId: number;
  title?: string;
  description?: string;
  content?: string;
  slug?: string | null;
  tags?: string[];
  previewBuffer?: Buffer | null;
}

export interface UpdateResult {
  post: Post;
}

export const UpdateUseCase: UseCaseFunction<UpdateParams, UpdateResult> = (
  { repository, lib, service },
  { postId, userId, title, description, content, slug, tags, previewBuffer }
) =>
  repository.$transaction(async (tx) => {
    const [post, postUser, existingPostBySlug] = await Promise.all([
      repository.post.get(
        {
          where: { id: postId, deleted: false }
        },
        tx
      ),
      repository.postUser.get(
        {
          where: {
            postId,
            userId,
            role: PostUserRole.EDITOR,
            user: { banned: false }
          }
        },
        tx
      ),
      !!slug &&
        repository.post.get(
          {
            where: {
              slug
            }
          },
          tx
        )
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
    if (existingPostBySlug) {
      throw new InvalidDataError({
        code: 'SLUG_ALREADY_EXISTS',
        message: 'Slug already exists.'
      });
    }

    await Promise.all([
      (async () => {
        const dataUpdate: Record<string, unknown> = {};

        if (slug !== undefined) {
          dataUpdate.slug = slug;
        }

        const [htmlTitle, htmlDescription, htmlContent] = await Promise.all([
          !!title && lib.markdown.render(title),
          !!description && lib.markdown.render(description),
          !!content && lib.markdown.render(content)
        ]);

        if (title && htmlTitle) {
          dataUpdate.title = title;
          dataUpdate.htmlTitle = htmlTitle;
        }
        if (description && htmlDescription) {
          dataUpdate.description = description;
          dataUpdate.htmlDescription = htmlDescription;
        }
        if (content && htmlContent) {
          dataUpdate.content = content;
          dataUpdate.htmlContent = htmlContent;
        }

        await repository.post.update(
          { where: { id: postId }, data: dataUpdate },
          tx
        );
      })(),
      !!tags &&
        (async () => {
          const upsertedTags = await repository.tag.upsertByNames(
            {
              names: tags
            },
            tx
          );

          await repository.postTag.replaceTags({
            postId,
            tagIds: upsertedTags.map((tag) => tag.id),
            tx
          });
        })(),
      !!previewBuffer &&
        service.post.writePreview({ postId, buffer: previewBuffer })
    ]);

    const updatedPost =
      (await repository.post.get(
        {
          where: { id: postId },
          select: 'item'
        },
        tx
      )) ?? post;

    return { post: updatedPost };
  });
