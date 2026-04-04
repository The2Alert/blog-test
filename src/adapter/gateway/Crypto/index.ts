import { AbstractGateway } from '@/adapter/gateway/abstract';
import { ComparePasswordParams, HashPasswordParams } from './types';

export class CryptoGateway extends AbstractGateway {
  private readonly bcrypt = this.lib.bcrypt;

  public comparePassword({
    password,
    hashedPassword
  }: ComparePasswordParams): Promise<boolean> {
    return this.bcrypt.compare(password, hashedPassword);
  }

  public hashPassword({ password }: HashPasswordParams): Promise<string> {
    return this.bcrypt.hash(password, 10);
  }
}
