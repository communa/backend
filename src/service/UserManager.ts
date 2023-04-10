import { validate } from 'class-validator';
import { inject, injectable } from 'inversify';
import { User } from '../entity/User';
import AuthenticationException from '../exception/AuthenticationException';
import ConstraintsValidationException from '../exception/ConstraintsValidationException';
import { UserEqualPasswordsException } from '../exception/UserEqualPasswordsException';
import { EUserRole } from '../interface/EUserRole';
import { IKeyPair } from '../interface/IKeyPair';
import { UserRepository } from '../repository/UserRepository';
import { Authenticator } from './Authenticator';
import { Mailer } from './Mailer';
import { SubstrateConnector } from './SubstrateConnector';

@injectable()
export class UserManager {
  @inject('UserRepository')
  protected userRepository: UserRepository;
  @inject('SubstrateConnector')
  protected substrateConnector: SubstrateConnector;
  @inject('Mailer')
  protected mailer: Mailer;

  public async createFromKeyPair(keypair: IKeyPair): Promise<User> {
    const user = new User();

    user.address = keypair.address;
    user.roles = [EUserRole.ROLE_HOST, EUserRole.ROLE_USER];

    return this.userRepository.saveSingle(user);
  }

  public async saveSingle(user: User): Promise<User> {
    if (user.passwordPlain) {
      user.password = Authenticator.hashPassword(user.passwordPlain);
    }

    return this.userRepository.saveSingle(user);
  }

  async editValidateAndSave(user: User, data: User): Promise<User> {
    if (data.passwordPlain && data.passwordOld) {
      if (data.passwordPlain === data.passwordOld) {
        throw new UserEqualPasswordsException(
          'Password cannot be the same as the previous password'
        );
      }
      const isValid = Authenticator.isPlainPasswordValid(user, data.passwordOld);

      if (!isValid) {
        throw new AuthenticationException('The old password is wrong');
      }
    }

    if (data.passwordPlain) {
      user.password = Authenticator.hashPassword(data.passwordPlain);
    }

    user.email = data.email;
    user.bio = data.bio;
    user.phone = data.phone;
    user.roles = data.roles;
    user.tz = data.tz;
    user.userName = data.userName;

    const errors = await validate(user, { groups: ['edit'] });

    if (errors.length) {
      throw new ConstraintsValidationException(errors);
    }

    return this.userRepository.saveSingle(user);
  }
}
