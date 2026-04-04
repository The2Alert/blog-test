import { AbstractUseCase } from '@/domain/usecase/abstract';

export class AppUseCase extends AbstractUseCase {
  public async execute(): Promise<void> {
    const { service } = this;

    await service.user.appInitialize();
  }
}
