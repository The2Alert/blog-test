import { AbstractUseCase } from '@/domain/usecase/abstract';
import { CreateUseCase } from './Create';
import { DeletePostUseCase } from './Delete';
import { GetByIdOrSlugUseCase } from './GetByIdOrSlug';
import { GetListUseCase } from './GetList';
import { ReadPreviewUseCase } from './ReadPreview';
import { UpdateUseCase } from './Update';

export class PostUseCase extends AbstractUseCase {
  public readonly create = CreateUseCase.bind(null, this.params);
  public readonly update = UpdateUseCase.bind(null, this.params);
  public readonly getByIdOrSlug = GetByIdOrSlugUseCase.bind(null, this.params);
  public readonly getList = GetListUseCase.bind(null, this.params);
  public readonly delete = DeletePostUseCase.bind(null, this.params);
  public readonly readPreview = ReadPreviewUseCase.bind(null, this.params);
}
