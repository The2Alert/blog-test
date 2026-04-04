import { ServiceFunction } from '@/domain/service/types';

export type GetAvatarPathParams = {
  user: {
    login: string;
  };
  size?: number;
};

export type GetAvatarPathResult = string;

export const GetAvatarPathService: ServiceFunction<
  GetAvatarPathParams,
  GetAvatarPathResult
> = async (_, { user, size = 128 }) =>
  `User/Files/${user.login}/avatar${size}x${size}.png`;
