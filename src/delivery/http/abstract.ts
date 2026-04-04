import { HttpParams } from './types';

export abstract class AbstractHttp {
  constructor(public readonly params: HttpParams) {}
}
