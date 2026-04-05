import { AbstractGateway } from '@/adapter/gateway/abstract';
import { ProcessPreviewParams, ProcessPreviewResult } from './types';

export class PostGateway extends AbstractGateway {
  private readonly sharp = this.lib.sharp;

  public async processPreview({
    buffer
  }: ProcessPreviewParams): Promise<ProcessPreviewResult> {
    const mimeType = 'image/png';

    const [ratio1x1, ratio4x3, ratio16x9] = [
      this.sharp(buffer).resize(1024, 1024, { fit: 'cover' }).png(),
      this.sharp(buffer).resize(1024, 768, { fit: 'cover' }).png(),
      this.sharp(buffer).resize(1024, 576, { fit: 'cover' }).png()
    ];
    const [ratio1x1Buffer, ratio4x3Buffer, ratio16x9Buffer] = await Promise.all(
      [ratio1x1.toBuffer(), ratio4x3.toBuffer(), ratio16x9.toBuffer()]
    );

    return {
      '1x1': {
        mimeType,
        width: 1024,
        height: 1024,
        size: ratio1x1Buffer.length,
        buffer: ratio1x1Buffer
      },
      '4x3': {
        mimeType,
        width: 1024,
        height: 768,
        size: ratio4x3Buffer.length,
        buffer: ratio4x3Buffer
      },
      '16x9': {
        mimeType,
        width: 1024,
        height: 576,
        size: ratio16x9Buffer.length,
        buffer: ratio16x9Buffer
      }
    };
  }
}
