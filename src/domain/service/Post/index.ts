import { AbstractService } from '@/domain/service/abstract';
import { GetPreviewPathService } from './GetPreviewPath';
import { WritePreviewService } from './WritePreview';

export class PostService extends AbstractService {
  public readonly getPreviewPath = GetPreviewPathService.bind(
    null,
    this.params
  );
  public readonly writePreview = WritePreviewService.bind(null, this.params);
}
