import { ServiceFunction } from '@/domain/service/types';

export const GetAdminIdService: ServiceFunction<void, number> = async ({
  config
}) => config.admin.id;
