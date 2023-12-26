import {inject, injectable} from 'inversify';

import {User} from '../entity/User';
import {IConfigParameters} from '../interface/IConfigParameters';
import AuthenticationException from '../exception/AuthenticationException';
import {RedisClient} from './RedisClient';
import {Signer} from './Signer';
import {Authenticator} from './Authenticator';
import {EAuthTimeTrackerState} from '../interface/EAuthTimeTrackerState';

@injectable()
export class AuthenticatorTimeTracker {
  @inject('parameters')
  protected parameters: IConfigParameters;
  @inject('Signer')
  protected signer: Signer;
  @inject('RedisClient')
  protected redis: RedisClient;
  @inject('Authenticator')
  protected authenticator: Authenticator;

  public async timeTrackerNonceGenerate(ip: string): Promise<string> {
    const nonce = this.signer.generateNonce();
    const key = `timetracker:nonce:${nonce}`;
    const dataExisting = await this.redis.get(key);

    if (dataExisting) {
      throw new AuthenticationException('the given nonce already persisted');
    }

    const data = {
      nonce,
      ip,
      state: EAuthTimeTrackerState.INIT
    };

    await this.redis.setWithExpiry(key, data, Authenticator.nonceExpiresIn);

    return Promise.resolve(nonce);
  }

  public async timeTrackerLogin(nonce: string, ip: string) {
    const nonceData = await this.redis.get(`timetracker:nonce:${nonce}`);
    const key = `timetracker:nonce:${nonce}`;

    if (nonceData.ip !== ip) {
      throw new AuthenticationException('ip address mismatch');
    }

    const data = {
      nonce,
      ip,
      state: EAuthTimeTrackerState.LOGIN
    };

    await this.redis.setWithExpiry(key, data, Authenticator.nonceExpiresIn);
  }

  public async timeTrackerConnect(nonce: string, user: User, ip: string) {
    const loginData = await this.redis.get(`timetracker:nonce:${nonce}`);

    if (loginData.ip !== ip) {
      throw new AuthenticationException('ip address mismatch');
    }

    const key = `timetracker:nonce:${nonce}`;
    const data = {
      nonce,
      ip,
      state: EAuthTimeTrackerState.CONNECTED,
      jwt: this.authenticator.getTokens(user),
    };

    await this.redis.setWithExpiry(key, data, Authenticator.nonceExpiresIn);
  }

  public async timeTrackerNonceGet(nonce: string, ip: string) {
    const key = `timetracker:nonce:${nonce}`;
    const data = await this.redis.get(key);

    if (!data) {
      throw new AuthenticationException('the given nonce is not available for log in');
    }
    if (data.ip !== ip) {
      throw new AuthenticationException('ip address mismatch');
    }

    return data;
  }
}
