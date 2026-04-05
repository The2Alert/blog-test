export type PreviewRatio = '1x1' | '4x3' | '16x9';

export interface ProcessPreviewParams {
  buffer: Buffer;
}

export interface ProcessPreviewResult {
  '1x1': {
    mimeType: string;
    width: number;
    height: number;
    size: number;
    buffer: Buffer;
  };
  '4x3': {
    mimeType: string;
    width: number;
    height: number;
    size: number;
    buffer: Buffer;
  };
  '16x9': {
    mimeType: string;
    width: number;
    height: number;
    size: number;
    buffer: Buffer;
  };
}
