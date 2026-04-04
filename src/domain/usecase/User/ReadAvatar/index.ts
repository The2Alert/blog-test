import type { Readable } from 'node:stream';
import { NotFoundError } from '@/domain/errors';
import { UseCaseFunction } from '@/domain/usecase/types';

export type ReadAvatarParams = {
  userId: number;
};

export type ReadAvatarResult = {
  stream: Readable;
  mimeType: string;
};

export const ReadAvatarUseCase: UseCaseFunction<
  ReadAvatarParams,
  ReadAvatarResult
> = async ({ repository, gateway, service }, { userId }) => {
  const user = await repository.user.get({
    where: { id: userId, banned: false },
    select: 'basic'
  });

  if (!user) {
    throw new NotFoundError({
      message: 'User not found.',
      code: 'USER_NOT_FOUND'
    });
  }

  let avatarPath: string | null;
  let mimeType: string | null;

  if (user.avatar128x128) {
    avatarPath = user.avatar128x128.path;
    avatarPath ??= await service.user.getAvatarPath({ user, size: 128 });
    mimeType = user.avatar128x128.mimeType;
  } else {
    avatarPath = null;
    mimeType = null;
  }

  if (!avatarPath || !mimeType) {
    throw new NotFoundError({
      code: 'USER_AVATAR_NOT_FOUND',
      message: 'User avatar not found.'
    });
  }

  const stream = gateway.data.createReadStream({ path: avatarPath });

  return { stream, mimeType };
};
