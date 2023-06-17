import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import validator from 'validator';
import { inject, injectable } from 'inversify';

import { User } from '../entity/User';
import { Mailer } from './Mailer';

import { IAuthTokenData } from '../interface/IAuthTokenData';
import { UserRepository } from '../repository/UserRepository';
import { EUserRole } from '../interface/EUserRole';
import { IAuthTokens } from '../interface/IAuthTokens';
import { IConfigParameters } from '../interface/IConfigParameters';
import AuthenticationException from '../exception/AuthenticationException';
import { UserManager } from './UserManager';
import { isEmail } from 'class-validator';

@injectable()
export class Authenticator {
  protected accessTokenExpiresIn: number = 60 * 60 * 3; // three hours
  protected refreshTokenExpiresIn: number = 60 * 60 * 24; // 24 hours

  @inject('UserRepository')
  protected userRepository: UserRepository;
  @inject('UserManager')
  protected userManager: UserManager;
  @inject('Mailer')
  protected mailer: Mailer;
  @inject('parameters')
  protected parameters: IConfigParameters;

  public async registerCustomer(user: User): Promise<User> {
    user.roles = [EUserRole.ROLE_USER];

    const newUser = await this.register(user);

    if (newUser.email) {
      this.mailer.sendUserNewEmail(newUser);
    }
    if (newUser.phone) {
      // send SMS ?
    }

    return newUser;
  }

  public async registerHost(user: User): Promise<User> {
    user.roles = [EUserRole.ROLE_USER, EUserRole.ROLE_BUSINESS];

    const newUser = await this.register(user);

    return newUser;
  }

  public async register(user: User): Promise<User> {
    const isEmail = validator.isEmail(user.emailOrPhone);

    if (isEmail) {
      user.email = user.emailOrPhone;
    } else {
      user.phone = user.emailOrPhone;
    }

    return await this.userManager.saveSingle(user);
  }

  public async login(emailOrPhone: string, password: string): Promise<User> {
    const user: User | undefined = await this.userRepository.findByEmailPhone(emailOrPhone);

    if (!user || !Authenticator.isPlainPasswordValid(user, password)) {
      throw new AuthenticationException('username or password is incorrect');
    }

    return user;
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
      const emailOrPhone = this.getEmailOrPhoneOrThrowError(token);
      const user = await this.userRepository.findByEmailPhone(emailOrPhone);

      if (user) {
        return Promise.resolve(user);
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

    return { accessToken, refreshToken };
  }

  public generateRefreshToken(user: User): string {
    return jwt.sign({ id: user.id }, this.parameters.jwtSecret, {
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

  public static isPlainPasswordValid(user: User, plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, user.password);
  }

  public async forgotPassword(emailOrPhone: string) {
    const user = await this.userRepository.findByEmailPhone(emailOrPhone);

    if (!user) {
      throw new AuthenticationException('e-mail address or phone number is missing in the system');
    }
    const token = this.generateJwtToken(user);
    user.resetPasswordJwtIat = this.getJwtIatOrThrowError(token);
    await this.userRepository.saveSingle(user);

    const isInputDataAnEmail = isEmail(emailOrPhone);

    if (isInputDataAnEmail) {
      this.mailer.sendUserResetPasswordEmail(user, token);
    }
  }
}
