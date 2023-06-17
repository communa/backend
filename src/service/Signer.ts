import { injectable, inject } from 'inversify';
import * as web3 from 'web3';

import { IConfigParameters } from '../interface/IConfigParameters';

@injectable()
export class Signer {
  @inject('parameters')
  protected parameters: IConfigParameters;

  public generateNonce(): string {
    return web3.utils.randomHex(10);
  }

  public verify(nonce: string, signature: string, address: string): boolean {
    const recoveredAddress = web3.eth.accounts.recover(nonce, signature);

    return recoveredAddress === address;
  }
}
