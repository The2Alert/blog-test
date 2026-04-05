import { AbstractUseCase } from '@/domain/usecase/abstract';
import { BanUseCase } from './Ban';
import { GetByIdOrLoginUseCase } from './GetByIdOrLogin';
import { GetListUseCase } from './GetList';
import { ReadAvatarUseCase } from './ReadAvatar';
import { UnbanUseCase } from './Unban';
import { UpdateUseCase } from './Update';

export class UserUseCase extends AbstractUseCase {
  public readonly readAvatar = ReadAvatarUseCase.bind(null, this.params);
  public readonly ban = BanUseCase.bind(null, this.params);
  public readonly unban = UnbanUseCase.bind(null, this.params);
  public readonly update = UpdateUseCase.bind(null, this.params);
  public readonly getByIdOrLogin = GetByIdOrLoginUseCase.bind(
    null,
    this.params
  );
  public readonly getList = GetListUseCase.bind(null, this.params);
}
