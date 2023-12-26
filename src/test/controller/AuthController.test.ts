import faker from 'faker';
import {expect} from 'chai';
import * as web3 from 'web3';
import {suite, test} from '@testdeck/mocha';

import {UserRepository} from '../../repository/UserRepository';
import {BaseControllerTest} from './BaseController.test';
import {RedisClient} from '../../service/RedisClient';
import {AuthenticatorTimeTracker} from '../../service/AuthenticatorTimeTracker';
import {EAuthTimeTrackerState} from '../../interface/EAuthTimeTrackerState';

@suite()
export class AuthControllerTest extends BaseControllerTest {
  protected userRepository: UserRepository;
  protected redisClient: RedisClient;
  protected authenticatorTimeTracker: AuthenticatorTimeTracker;

  constructor() {
    super();

    this.redisClient = this.container.get('RedisClient');
    this.authenticatorTimeTracker = this.container.get('AuthenticatorTimeTracker');
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
  async timeTrackerNonceGenerate() {
    const ip = '127.0.0.1';
    const res = await this.http.request({
      url: `${this.url}/api/auth/timeTracker/nonce`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const nonce = res.data as string;
    const key = `timetracker:nonce:${nonce}`;
    const data = await this.redisClient.get(key);

    expect(res.status).to.be.equal(200);
    expect(nonce.length).to.be.eq(32);
    expect(data).to.be.deep.eq({
      nonce,
      ip,
      state: EAuthTimeTrackerState.INIT,
    });
  }

  @test()
  async timeTrackerNonceGet() {
    const ip = '127.0.0.1';
    const nonce = await this.authenticatorTimeTracker.timeTrackerNonceGenerate(ip);
    const user = await this.userFixture.createUser();
    const token = this.authenticator.generateJwtToken(user);

    const res = await this.http.request({
      url: `${this.url}/api/auth/timeTracker/${nonce}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.equal({
      nonce,
      state: EAuthTimeTrackerState.INIT,
      ip,
    });
  }

  @test()
  async timeTrackerLogin() {
    const ip = '127.0.0.1';
    const nonce = await this.authenticatorTimeTracker.timeTrackerNonceGenerate(ip);

    const res = await this.http.request({
      url: `${this.url}/api/auth/timeTracker/${nonce}/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        nonce,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.eq({});
  }

  @test()
  async timeTrackerConnect() {
    const ip = '127.0.0.1';
    const user = await this.userFixture.createUser();
    const token = this.authenticator.generateJwtToken(user);

    const nonce = await this.authenticatorTimeTracker.timeTrackerNonceGenerate(ip);
    await this.authenticatorTimeTracker.timeTrackerLogin(nonce, ip);

    const res = await this.http.request({
      url: `${this.url}/api/auth/timeTracker/${nonce}/connect`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data).to.be.deep.eq({});
  }

  @test()
  async timeTrackerJwt() {
    const ip = '127.0.0.1';
    const user = await this.userFixture.createUser();
    const nonce = await this.authenticatorTimeTracker.timeTrackerNonceGenerate(ip);
    const token = this.authenticator.generateJwtToken(user);

    await this.authenticatorTimeTracker.timeTrackerLogin(nonce, ip);
    await this.authenticatorTimeTracker.timeTrackerConnect(nonce, user, ip);

    const res = await this.http.request({
      url: `${this.url}/api/auth/timeTracker/${nonce}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    expect(res.status).to.be.equal(200);
    expect(res.data.nonce).to.be.eq(nonce);
    expect(res.data.state).to.be.eq(EAuthTimeTrackerState.CONNECTED);
    expect(res.data.ip).to.be.eq(ip);
    expect(res.data).to.have.property('jwt');
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
