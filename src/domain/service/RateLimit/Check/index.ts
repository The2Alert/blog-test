import { ServiceFunction } from '@/domain/service/types';

export interface CheckParams {
  ip: string;
  routeKey: string;
  windowMs: number;
  max: number;
}

export interface CheckResult {
  allowed: boolean;
  count: number;
}

export const CheckService: ServiceFunction<CheckParams, CheckResult> = async (
  { repository },
  { ip, routeKey, windowMs, max }
) => {
  const key = `${routeKey}:${ip}`;
  const { count } = await repository.rateLimit.increment({
    key,
    windowMs
  });

  return {
    allowed: count <= max,
    count
  };
};
