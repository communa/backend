import { injectable, inject } from 'inversify';
import * as web3 from 'web3';

import faker from 'faker';

import { IConfigParameters } from '../interface/IConfigParameters';

@injectable()
export class Signer {
  @inject('parameters')
  protected parameters: IConfigParameters;

  public generateNonce(): string {
    return faker.datatype.uuid();
  }

  public verify(nonce: string, signature: string, address: string): boolean {
    const recoveredAddress = web3.eth.accounts.recover(nonce, signature);

    return recoveredAddress === address;
  }
}
