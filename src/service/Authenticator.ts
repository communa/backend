import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {inject, injectable} from 'inversify';

import QRCode from 'qrcode';

import {User} from '../entity/User';
import {Mailer} from './Mailer';

import {IAuthTokenData} from '../interface/IAuthTokenData';
import {UserRepository} from '../repository/UserRepository';
import {EUserRole} from '../interface/EUserRole';
import {IAuthTokens} from '../interface/IAuthTokens';
import {IConfigParameters} from '../interface/IConfigParameters';
import AuthenticationException from '../exception/AuthenticationException';
import {UserManager} from './UserManager';
import {RedisClient} from './RedisClient';
import {Signer} from './Signer';
import {App} from '../app/App';
import {AuthClient} from '@walletconnect/auth-client';

@injectable()
export class Authenticator {
  protected accessTokenExpiresIn: number = 60 * 60 * 3; // three hours
  protected refreshTokenExpiresIn: number = 60 * 60 * 24; // 24 hours
  protected loginSeconds: number = 1000 * 60 * 10; // 10 minutes

  @inject('UserRepository')
  protected userRepository: UserRepository;
  @inject('UserManager')
  protected userManager: UserManager;
  @inject('Mailer')
  protected mailer: Mailer;
  @inject('parameters')
  protected parameters: IConfigParameters;
  @inject('Signer')
  protected signer: Signer;
  @inject('RedisClient')
  protected redis: RedisClient;

  public async getNonce(address: string): Promise<string> {
    const nonce = this.signer.generateNonce();
    const key = `nonce:${address}`;

    await this.redis.setWithExpiry(key, nonce, this.loginSeconds);

    return nonce;
  }

  public async getNonceQr(): Promise<string> {
    const nonce = this.signer.generateNonce();

    const key = `nonceQr:${nonce}`;

    await this.redis.setWithExpiry(key, nonce, this.loginSeconds);

    return Promise.resolve(nonce);
  }

  public async getNonceQrStatus(nonce: string): Promise<IAuthTokens | any> {
    const key = `nonceQr:${nonce}`;

    const address = await this.redis.get(key);

    if (!address) {
      return {};
    }

    const user = await this.userRepository.findByAddressPublic(address);

    if (!user) {
      return {};
    }

    return this.getTokens(user);
  }

  public async generateQrImage(nonce: string): Promise<Buffer> {
    if (!App.authClient) {
      App.authClient = await AuthClient.init(this.parameters.walletConnect);

      App.authClient.on('auth_request', ({id, params}) => {
        console.log(id, params);
      })

      App.authClient.on('auth_response', ({id, params}) => {
        console.log(id, params);
      })
    }

    const authRequest = await App.authClient.request({
      aud: this.parameters.homepage,
      domain: this.parameters.domain,
      chainId: 'eip155:1',
      type: 'eip4361',
      nonce,
    });
    const data = await QRCode.toDataURL(authRequest.uri as string, {
      width: 350
    });
    const base64Data = data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const img = Buffer.from(base64Data, 'base64');
    const key = `nonceQrLogin:${nonce}`;

    await this.redis.setWithExpiry(key, nonce, this.loginSeconds);

    console.log(authRequest);
    console.log(nonce);
    console.log(img);

    return img;
  }

  public async loginWeb3(signature: string, address: string): Promise<IAuthTokens> {
    const key = `nonce:${address}`;
    const nonce = await this.redis.get(key);

    if (!nonce) {
      throw new AuthenticationException('Nonce is not available or expired');
    }

    const isValid = this.signer.verify(nonce, signature, address);

    if (!isValid) {
      throw new AuthenticationException('Signature is not valid');
    }

    let user = await this.userRepository.findByAddressPublic(address);

    if (!user) {
      user = new User();
      user.address = address;
      user.roles = [EUserRole.ROLE_USER];
      user = await this.userManager.saveSingle(user);
    }

    return this.getTokens(user);
  }

  public async getUserFromRefreshToken(token: string): Promise<User> {
    const payload = this.decodeJwtToken(token);
    const userId = (payload as jwt.JwtPayload).id;

    if (!userId) {
      throw new AuthenticationException('Refresh token is not valid');
    }

    try {
      return await this.userRepository.findOneByIdOrFail(userId);
    } catch (err) {
      throw new AuthenticationException('User does not exist');
    }
  }

  public async getUserFromJwtTokenOrThrowException(token: string): Promise<User> {
    const user = await this.getUserFromJwtToken(token);

    if (!user) {
      throw new AuthenticationException('invalid auth token');
    }

    return user;
  }

  public async getUserFromJwtToken(token: string): Promise<User | any> {
    try {
      const tokenData: any = this.decodeJwtToken(token);

      // console.log(tokenData);

      if (tokenData.emailOrPhone) {
        const user = await this.userRepository.findByEmailPhone(tokenData.emailOrPhone);

        if (user) {
          return Promise.resolve(user);
        }
      }
      if (tokenData.address) {
        const user = await this.userRepository.findByAddressPublic(tokenData.address);

        if (user) {
          return Promise.resolve(user);
        }
      }

      return Promise.resolve(null);
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  public getEmailOrPhoneOrThrowError(token: string): string {
    const tokenData: any = this.decodeJwtToken(token);

    return tokenData.emailOrPhone;
  }

  public getJwtIatOrThrowError(token: string): string {
    const tokenData: any = this.decodeJwtToken(token);

    return tokenData.iat.toString();
  }

  public decodeJwtToken(token: string) {
    return jwt.verify(token, this.parameters.jwtSecret);
  }

  public getTokens(user: User): IAuthTokens {
    const accessToken = this.generateJwtToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {accessToken, refreshToken};
  }

  public generateRefreshToken(user: User): string {
    return jwt.sign({id: user.id}, this.parameters.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  public generateJwtToken(user: User): string {
    const data: IAuthTokenData = {
      id: user.id,
      address: user.address,
      emailOrPhone: user.email || user.phone,
    };

    return jwt.sign(data, this.parameters.jwtSecret, {
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  public static hashPassword(plainPassword: string): string {
    return bcrypt.hashSync(plainPassword, 8);
  }
}
