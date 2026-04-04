import { AuthGateway } from './Auth';
import { CryptoGateway } from './Crypto';
import { DataGateway } from './Data';
import { ImageGateway } from './Image';
import { AbstractGateway } from './abstract';

export class Gateway extends AbstractGateway {
  public readonly auth = new AuthGateway(this.params);
  public readonly crypto = new CryptoGateway(this.params);
  public readonly image = new ImageGateway(this.params);
  public readonly data = new DataGateway(this.params);
}
