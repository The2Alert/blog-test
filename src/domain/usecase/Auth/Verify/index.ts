import { VerifyParams, VerifyResult } from '@/domain/service/Auth/Verify';
import { UseCaseFunction } from '@/domain/usecase/types';

export const VerifyUseCase: UseCaseFunction<VerifyParams, VerifyResult> = (
  { service },
  params
) => service.auth.verify(params);
