import { AbstractService } from '@/domain/service/abstract';
import { BanService } from './Ban';
import { CreateAdminService } from './CreateAdmin';
import { GetAdminIdService } from './GetAdminId';
import { GetAvatarPathService } from './GetAvatarPath';
import { UnbanService } from './Unban';

export class UserService extends AbstractService {
  public readonly createAdmin = CreateAdminService.bind(null, this.params);
  public readonly getAdminId = GetAdminIdService.bind(null, this.params);
  public readonly getAvatarPath = GetAvatarPathService.bind(null, this.params);
  public readonly ban = BanService.bind(null, this.params);
  public readonly unban = UnbanService.bind(null, this.params);

  public async appInitialize() {
    const { appInfo, config } = this;

    if (appInfo.isWorkerProcess) {
      return;
    }

    await this.createAdmin(config.admin);
  }
}
