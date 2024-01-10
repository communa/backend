import faker from 'faker';
import {expect} from 'chai';
import * as web3 from 'web3';
import {suite, test} from '@testdeck/mocha';

import {UserRepository} from '../../repository/UserRepository';
import {BaseControllerTest} from './BaseController.test';
import {RedisClient} from '../../service/RedisClient';
import {AuthenticatorTimeTracker} from '../../service/AuthenticatorTimeTracker';

@suite()
export class AuthControllerTest extends BaseControllerTest {
  protected userRepository: UserRepository;
  protected redisClient: RedisClient;
  protected authenticatorTimeTracker: AuthenticatorTimeTracker;

  constructor() {
    super();

    this.redisClient = this.container.get('RedisClient');
    this.userRepository = this.container.get('UserRepository');
  }

  @test()
  async loginWeb3() {
    const account = web3.eth.accounts.create();
    const nonce = await this.authenticator.getNonce(account.address);
    const signature = web3.eth.accounts.sign(nonce, account.privateKey);

    const res = await this.http.request({
      url: `${this.url}/api/auth/web3`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        signature: signature.signature,
        address: account.address,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({});
  }

  @test()
  async nonce() {
    const account = web3.eth.accounts.create();

    const res = await this.http.request({
      url: `${this.url}/api/auth/nonce`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        address: account.address,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.length).to.be.eq(32);
  }

  @test()
  async refresh() {
    const user = await this.userFixture.createUser();

    const config = {
      url: `${this.url}/api/auth/refresh`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        refreshToken: this.authenticator.generateRefreshToken(user)
      }
    };

    console.log(this.authenticator.generateRefreshToken(user));

    const res = await this.http.request(config);

    expect(res.status).to.be.equal(200);
    expect(res.headers).to.contain.keys(['authorization', 'refresh-token']);
  }

  @test()
  async status_user() {
    const user = await this.userFixture.createUser();
    const token = this.authenticator.generateJwtToken(user);

    const config = {
      url: `${this.url}/api/auth/status`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const res = await this.http.request(config);

    expect(res.data).to.have.property('id');
    expect(res.data).not.to.have.property('password');
    expect(res.data).not.to.have.property('resetPasswordJwtIat');

    expect(res.data.email).to.be.equal(user.email);
    expect(res.data.id).to.be.equal(user.id);
  }

  @test()
  async status_invalidDoNotThrowException() {
    const token = faker.datatype.uuid();

    const config = {
      url: `${this.url}/api/auth/status`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const res = await this.http.request(config);

    expect(res.data).to.be.equal('');
  }
}
