import {skip, suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {Keyring} from '@polkadot/keyring';
import {u8aToHex} from '@polkadot/util';

import {AuthenticatorSubstrate} from '../../service/AuthenticatorSubstrate';

import {UserFixture} from '../fixture/UserFixture';
import {BaseControllerTest} from './BaseController.test';
import {UserRepository} from '../../repository/UserRepository';

@suite()
export class AuthSubstrateController extends BaseControllerTest {
  protected userFixture: UserFixture;
  protected authenticator: AuthenticatorSubstrate;
  protected userRepository: UserRepository;

  constructor() {
    super();

    this.userFixture = this.container.get('UserFixture');
    this.authenticator = this.container.get('AuthenticatorSubstrate');
    this.userRepository = this.container.get('UserRepository');
  }

  @skip
  @test()
  async register() {
    const res = await this.http.request({
      url: `${this.url}/api/auth/substrate/register`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const user = await this.userRepository.findOneByOrFail({
      where: {
        address: res.data.address,
      },
    });

    expect(res.status).to.be.equal(201);
    expect(res.data).to.contain.keys(['mnemonic', 'address']);
    expect(res.data.address).to.be.eq(user.address);
    expect(res.data.mnemonic).not.be.empty;
    expect(res.data.address).not.be.empty;
    expect(res.data.address).not.be.empty;
  }

  @skip
  @test()
  async login() {
    const account = await this.authenticator.register();
    const nonce = await this.authenticator.getNonce(account.address);

    const keyring = new Keyring();
    const pair = keyring.addFromMnemonic(account.mnemonic);
    const signature = u8aToHex(pair.sign(nonce, {withType: true}));

    const res = await this.http.request({
      url: `${this.url}/api/auth/substrate/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        signature: signature,
        address: account.address,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});
  }

  @skip
  @test()
  async nonce() {
    const account = await this.authenticator.register();

    const res = await this.http.request({
      url: `${this.url}/api/auth/substrate/nonce`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        address: account.address,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.length).to.be.eq(202);
  }

  @skip
  @test()
  async status() {
    const account = await this.authenticator.register();

    const nonce = await this.authenticator.getNonce(account.address);
    const keyring = new Keyring();
    const pair = keyring.addFromMnemonic(account.mnemonic);
    const signature = u8aToHex(pair.sign(nonce, {withType: true}));

    const tokens = await this.authenticator.login(signature, account.address);

    const res = await this.http.request({
      url: `${this.url}/api/auth/substrate/status`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: tokens.accessToken,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.address).to.be.equal(account.address);
  }
}
