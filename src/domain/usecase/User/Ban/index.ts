import { BanParams } from '@/domain/service/User/Ban';
import { UseCaseFunction } from '@/domain/usecase/types';

export const BanUseCase: UseCaseFunction<BanParams> = ({ service }, params) =>
  service.user.ban(params);
