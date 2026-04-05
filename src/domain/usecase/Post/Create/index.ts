import { FileStatus, FileType } from '@/domain/entity/File';
import { Post } from '@/domain/entity/Post';
import { PostUserRole } from '@/domain/entity/PostUser';
import { ForbiddenError, InvalidDataError } from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface CreateParams {
  userId: number;
  title: string;
  description: string;
  content: string;
  slug?: string | null;
  tags?: string[];
  previewBuffer?: Buffer | null;
}

export interface CreateResult {
  post: Post;
}

export const CreateUseCase: UseCaseFunction<CreateParams, CreateResult> = (
  { repository, lib, service },
  { userId, title, description, content, slug, tags, previewBuffer }
) =>
  repository.$transaction(async (tx) => {
    const [user, existingPostBySlug] = await Promise.all([
      repository.user.get(
        {
          where: { id: userId, banned: false }
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

    if (!user) {
      throw new ForbiddenError({
        code: 'USER_FORBIDDEN',
        message: 'Access denied.'
      });
    }
    if (existingPostBySlug) {
      throw new InvalidDataError({
        code: 'SLUG_ALREADY_EXISTS',
        message: 'Slug already exists.'
      });
    }

    const [htmlTitle, htmlDescription, htmlContent] = await Promise.all([
      lib.markdown.render(title),
      lib.markdown.render(description),
      lib.markdown.render(content)
    ]);

    const createdPost = await repository.post.create(
      {
        data: {
          title,
          htmlTitle,
          description,
          htmlDescription,
          content,
          htmlContent,
          slug
        }
      },
      tx
    );

    await Promise.all([
      repository.postUser.create(
        {
          data: { postId: createdPost.id, userId, role: PostUserRole.EDITOR }
        },
        tx
      ),
      !!tags &&
        tags.length > 0 &&
        (async () => {
          const upsertedTags = await repository.tag.upsertByNames(
            {
              names: tags
            },
            tx
          );

          await repository.postTag.replaceTags({
            postId: createdPost.id,
            tagIds: upsertedTags.map((tag) => tag.id),
            tx
          });
        })(),
      !!previewBuffer &&
        (async () => {
          const writePreviewResult = await service.post.writePreview({
            postId: createdPost.id,
            buffer: previewBuffer
          });

          await repository.post.update(
            {
              where: {
                id: createdPost.id
              },
              data: {
                preview1x1: {
                  create: {
                    status: FileStatus.DONE,
                    type: FileType.IMAGE,
                    size: writePreviewResult['1x1'].size,
                    mimeType: 'image/png',
                    width: writePreviewResult['1x1'].width,
                    height: writePreviewResult['1x1'].height,
                    path: writePreviewResult['1x1'].path
                  }
                },
                preview4x3: {
                  create: {
                    status: FileStatus.DONE,
                    type: FileType.IMAGE,
                    size: writePreviewResult['4x3'].size,
                    mimeType: 'image/png',
                    width: writePreviewResult['4x3'].width,
                    height: writePreviewResult['4x3'].height,
                    path: writePreviewResult['4x3'].path
                  }
                },
                preview16x9: {
                  create: {
                    status: FileStatus.DONE,
                    type: FileType.IMAGE,
                    size: writePreviewResult['16x9'].size,
                    mimeType: 'image/png',
                    width: writePreviewResult['16x9'].width,
                    height: writePreviewResult['16x9'].height,
                    path: writePreviewResult['16x9'].path
                  }
                }
              }
            },
            tx
          );
        })()
    ]);

    const post =
      (await repository.post.get(
        {
          where: { id: createdPost.id },
          select: 'item'
        },
        tx
      )) ?? createdPost;

    return { post };
  });
