import { CheckParams, CheckResult } from '@/domain/service/RateLimit/Check';
import { UseCaseFunction } from '@/domain/usecase/types';

export const CheckUseCase: UseCaseFunction<CheckParams, CheckResult> = (
  { service },
  params
) => service.rateLimit.check(params);
