import {skip, suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {Keyring} from '@polkadot/keyring';
import {u8aToHex} from '@polkadot/util';

import {AppConfig} from '../../app/AppConfig';
import {AppContainer} from '../../app/AppContainer';
import {AuthenticatorSubstrate} from '../../service/AuthenticatorSubstrate';
import {AbstractDatabaseIntegration} from '../AbstractDatabase.integration';

@suite()
export class AuthenticatorSubstrateTest extends AbstractDatabaseIntegration {
  protected authenticator: AuthenticatorSubstrate;

  constructor() {
    super();
    const env = AppConfig.getEnv();
    const parameters = AppConfig.readLocal();
    const container = AppContainer.build(parameters, env);

    this.authenticator = container.get('AuthenticatorSubstrate');
  }

  @skip
  @test()
  async register() {
    const account = await this.authenticator.register();

    expect(account).to.contain.keys(['mnemonic', 'address']);
  }

  @skip
  @test()
  async login() {
    const account = await this.authenticator.register();

    const nonce = await this.authenticator.getNonce(account.address);
    const keyring = new Keyring();
    const pair = keyring.addFromMnemonic(account.mnemonic);
    const signature = u8aToHex(pair.sign(nonce, {withType: true}));

    const tokens = await this.authenticator.login(signature, account.address);

    expect(tokens).to.contain.keys(['accessToken', 'refreshToken']);
  }

  @skip
  @test()
  async login_failsWrongNonce() {
    const accountA = await this.authenticator.register();
    const accountB = await this.authenticator.register();

    const nonce = await this.authenticator.getNonce(accountB.address);
    const keyring = new Keyring();
    const pair = keyring.addFromMnemonic(accountA.mnemonic);
    const signature = u8aToHex(pair.sign(nonce, {withType: true}));

    let err = null;

    try {
      await this.authenticator.login(signature, accountA.address);
    } catch (e: any) {
      err = e;
    }

    expect(err.name).to.be.equal('AuthenticationException');
    expect(err.message).to.be.equal('Authentication error: Nonce not available or expired');
  }
}
