import { AbstractGateway } from '@/adapter/gateway/abstract';
import {
  GenerateBlurDataUrlParams,
  GenerateBlurDataUrlResult,
  GetImageDimensionsParams,
  GetImageDimensionsResult,
  ResizeImageParams,
  ResizeImageResult
} from './types';

export class ImageGateway extends AbstractGateway {
  private readonly sharp = this.lib.sharp;

  public async resizeImage({
    buffer,
    width,
    height,
    fit = 'cover'
  }: ResizeImageParams): Promise<ResizeImageResult> {
    const resizedBuffer = await this.sharp(buffer)
      .resize({ width, height, fit })
      .toBuffer();
    const dimensions = await this.sharp(resizedBuffer).metadata();

    return {
      buffer: resizedBuffer,
      width: dimensions.width ?? width,
      height: dimensions.height ?? height
    };
  }

  public async generateBlurDataUrl({
    buffer
  }: GenerateBlurDataUrlParams): Promise<GenerateBlurDataUrlResult> {
    const resizedBuffer = await this.sharp(buffer)
      .resize(8, 8, { fit: 'inside' })
      .png()
      .toBuffer();
    const blurDataUrl = `data:image/png;base64,${resizedBuffer.toString('base64')}`;

    return { blurDataUrl };
  }

  public async getImageDimensions({
    buffer
  }: GetImageDimensionsParams): Promise<GetImageDimensionsResult> {
    const metadata = await this.sharp(buffer).metadata();

    return { width: metadata.width ?? 0, height: metadata.height ?? 0 };
  }
}
