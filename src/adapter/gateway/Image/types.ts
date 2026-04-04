export interface ResizeImageParams {
  buffer: Buffer;
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface ResizeImageResult {
  buffer: Buffer;
  width: number;
  height: number;
}

export interface GenerateBlurDataUrlParams {
  buffer: Buffer;
}

export interface GenerateBlurDataUrlResult {
  blurDataUrl: string;
}

export interface GetImageDimensionsParams {
  buffer: Buffer;
}

export interface GetImageDimensionsResult {
  width: number;
  height: number;
}
