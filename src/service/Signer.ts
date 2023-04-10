import {injectable, inject} from 'inversify';
import {IConfigParameters} from '../interface/IConfigParameters';
import {IKeyPair} from '../interface/IKeyPair';

import {Keyring} from '@polkadot/keyring';
import {u8aToHex} from '@polkadot/util';
import {
  mnemonicGenerate,
  cryptoWaitReady,
  randomAsHex,
  decodeAddress,
  signatureVerify,
} from '@polkadot/util-crypto';
@injectable()
export class Signer {
  @inject('parameters')
  protected parameters: IConfigParameters;

  public generateKeyPair(): IKeyPair {
    const keyring = new Keyring({type: 'sr25519', ss58Format: 2});
    const mnemonic = mnemonicGenerate();

    const pair = keyring.addFromUri(mnemonic, {}, 'ed25519');

    return {
      mnemonic,
      address: pair.address,
    };
  }

  public generateNonce(): string {
    return randomAsHex(100);
  }

  public async verify(nonce: string, signature: string, address: string): Promise<boolean> {
    await cryptoWaitReady();

    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);

    const isValid = signatureVerify(nonce, signature, hexPublicKey).isValid;

    return isValid;
  }
}
