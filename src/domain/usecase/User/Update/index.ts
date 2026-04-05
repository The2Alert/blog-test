import { User } from '@/domain/entity/User';
import { UseCaseFunction } from '@/domain/usecase/types';

export interface UpdateParams {
  userId: number;
  name?: string | null;
  avatarBuffer?: Buffer | null;
}

export interface UpdateResult {
  user: User;
}

export const UpdateUseCase: UseCaseFunction<UpdateParams, UpdateResult> = (
  { service },
  params
) => service.user.update(params);
