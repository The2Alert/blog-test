import { User } from '@/domain/entity/User';
import { NotFoundError } from '@/domain/errors';
import { ServiceFunction } from '@/domain/service/types';

export interface UpdateParams {
  userId: number;
  name?: string | null;
  avatarBuffer?: Buffer | null;
}

export interface UpdateResult {
  user: User;
}

export const UpdateService: ServiceFunction<UpdateParams, UpdateResult> = (
  { repository, gateway, service },
  { userId, name, avatarBuffer }
) =>
  repository.$transaction(async (tx) => {
    const user = await repository.user.get(
      {
        where: { id: userId, banned: false },
        select: 'basic'
      },
      tx
    );

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
        message: 'User not found.'
      });
    }

    const dataUpdate: Record<string, unknown> = {};

    if (name !== undefined) {
      dataUpdate.name = name;
    }

    if (avatarBuffer) {
      const { buffer, size, width, height } = await gateway.user.processAvatar({
        buffer: avatarBuffer
      });

      const avatarPath = await service.user.getAvatarPath({ user, size: 128 });

      await gateway.data.writeFile({ path: avatarPath, content: buffer });

      const existingFile = await repository.file.get(
        {
          where: { path: avatarPath }
        },
        tx
      );

      let fileId: string;

      if (existingFile) {
        const updatedFile = await repository.file.update(
          {
            where: { id: existingFile.id },
            data: {
              size,
              width,
              height,
              mimeType: 'image/png',
              status: 'DONE'
            },
            select: 'default'
          },
          tx
        );

        fileId = updatedFile?.id ?? existingFile.id;
      } else {
        const createdFile = await repository.file.create(
          {
            data: {
              path: avatarPath,
              size,
              width,
              height,
              mimeType: 'image/png',
              type: 'IMAGE',
              status: 'DONE'
            },
            select: 'default'
          },
          tx
        );

        fileId = createdFile.id;
      }

      dataUpdate.avatar128x128Id = fileId;
    }

    const updatedUser = await repository.user.update(
      {
        where: { id: userId },
        data: dataUpdate,
        select: 'basic'
      },
      tx
    );

    return { user: updatedUser ?? user };
  });
