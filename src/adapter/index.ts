import { Gateway } from './gateway';
import { Repository } from './repository';
import { AdapterParams } from './types';

export class Adapter {
  public static create(params: AdapterParams): Adapter {
    return new Adapter(params);
  }

  public readonly gateway: Gateway;
  public readonly repository: Repository;

  constructor(protected readonly params: AdapterParams) {
    this.gateway = new Gateway(this.params);
    this.repository = new Repository(this.params);
  }
}
