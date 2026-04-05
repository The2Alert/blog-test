import { AbstractGateway } from '@/adapter/gateway/abstract';
import { ProcessAvatarParams, ProcessAvatarResult } from './types';

export class UserGateway extends AbstractGateway {
  private readonly sharp = this.lib.sharp;

  public async processAvatar({
    buffer
  }: ProcessAvatarParams): Promise<ProcessAvatarResult> {
    const processed = await this.sharp(buffer)
      .resize(128, 128, { fit: 'cover' })
      .png()
      .toBuffer();

    return {
      buffer: processed,
      size: processed.length,
      width: 128,
      height: 128
    };
  }
}
