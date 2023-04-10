import {injectable, inject} from 'inversify';
import * as jwt from 'jsonwebtoken';

import {Signer} from './Signer';
import {IAuthTokens} from '../interface/IAuthTokens';
import {IAuthTokenData} from '../interface/IAuthTokenData';
import {IConfigParameters} from '../interface/IConfigParameters';
import {SubstrateConnector} from './SubstrateConnector';
import {IKeyPair} from '../interface/IKeyPair';
import AuthenticationException from '../exception/AuthenticationException';
import {IUser} from '../interface/IUser';
import {RedisClient} from './RedisClient';
import {UserManager} from './UserManager';
import {UserRepository} from '../repository/UserRepository';

@injectable()
export class AuthenticatorSubstrate {
  protected accessTokenExpiresIn: number = 60 * 60 * 3; // three hours
  protected refreshTokenExpiresIn: number = 60 * 60 * 24; // 24 hours

  @inject('parameters')
  protected parameters: IConfigParameters;
  @inject('SubstrateConnector')
  protected substrateConnector: SubstrateConnector;
  @inject('Signer')
  protected signer: Signer;
  @inject('RedisClient')
  protected redis: RedisClient;
  @inject('UserManager')
  protected userManager: UserManager;
  @inject('UserRepository')
  protected userRepository: UserRepository;

  public async register(): Promise<IKeyPair> {
    const api = await this.substrateConnector.connect();
    const keypair = this.signer.generateKeyPair();

    await this.userManager.createFromKeyPair(keypair);
    await api.disconnect();

    return keypair;
  }

  public async login(signature: string, address: string): Promise<IAuthTokens> {
    const key = `login:${address}`;
    const nonce = await this.redis.get(key);

    if (!nonce) {
      throw new AuthenticationException('Nonce not available or expired');
    }

    const isValid = await this.signer.verify(nonce, signature, address);

    if (!isValid) {
      throw new AuthenticationException('Signature is not valid');
    }

    const user = this.findUserByAddressOrFail(address);
    const tokens = this.getTokens(user);

    return tokens;
  }

  public async getNonce(address: string): Promise<string> {
    const nonce = this.signer.generateNonce();
    const key = `login:${address}`;
    const seconds = 1000 * 60;

    await this.redis.setWithExpiry(key, nonce, seconds);

    return nonce;
  }

  public async getUserFromJwtToken(token: string): Promise<IUser | null> {
    try {
      const data: any = this.decodeJwtToken(token);

      const user = {
        address: data.address,
      };

      if (user) {
        return Promise.resolve(user);
      }

      return Promise.resolve(null);
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  public getUserFromRefreshToken(token: string): IUser {
    const payload = this.decodeJwtToken(token);
    const address: string = (payload as jwt.JwtPayload).address;

    if (!address) {
      throw new AuthenticationException('Refresh token is not valid');
    }

    try {
      return this.findUserByAddressOrFail(address);
    } catch (err) {
      throw new AuthenticationException('User does not exist');
    }
  }

  public async getUserFromJwtTokenOrThrowException(token: string): Promise<IUser> {
    const user = await this.getUserFromJwtToken(token);

    if (!user) {
      throw new AuthenticationException('invalid auth token');
    }

    return user;
  }

  public findUserByAddressOrFail(address: string): IUser {
    const user = {
      address,
    };

    return user;
  }

  private decodeJwtToken(token: string): jwt.JwtPayload | string {
    return jwt.verify(token, this.parameters.jwtSecret);
  }

  public getTokens(user: IUser): IAuthTokens {
    const accessToken = this.generateJwtToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  public generateRefreshToken(user: IUser): string {
    return jwt.sign({address: user.address}, this.parameters.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  public generateJwtToken(user: any): string {
    const data: IAuthTokenData = {
      id: user.address,
      address: user.address,
    };

    return jwt.sign(data, this.parameters.jwtSecret, {
      expiresIn: this.accessTokenExpiresIn,
    });
  }
}
