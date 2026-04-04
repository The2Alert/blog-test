import { UnbanParams } from '@/domain/service/User/Unban';
import { UseCaseFunction } from '@/domain/usecase/types';

export const UnbanUseCase: UseCaseFunction<UnbanParams> = (
  { service },
  params
) => service.user.unban(params);
