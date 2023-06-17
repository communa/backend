import { inject, injectable } from 'inversify';
import faker from 'faker';

import { User } from '../../entity/User';
import { EUserRole } from '../../interface/EUserRole';

import { UserRepository } from '../../repository/UserRepository';
import { Signer } from '../../service/Signer';
import { UserManager } from '../../service/UserManager';
import { Faker } from '../../service/Faker';

@injectable()
export class UserFixture {
  @inject('UserRepository')
  protected userRepository: UserRepository;
  @inject('Signer')
  protected signer: Signer;
  @inject('UserManager')
  protected userManager: UserManager;
  @inject('Faker')
  protected faker: Faker;

  public async createWithEmailAndPassword(email: string, passwordPlain: string): Promise<User> {
    const user = new User();

    user.email = email;
    user.emailOrPhone = email;
    user.passwordPlain = passwordPlain;
    user.roles = [EUserRole.ROLE_USER];
    user.tz = 'UTC';

    return this.userManager.saveSingle(user);
  }

  public async createWithPhoneAndPassword(phone: string, passwordPlain: string): Promise<User> {
    const user = new User();

    user.phone = phone;
    user.tz = 'UTC';
    user.passwordPlain = passwordPlain;
    user.roles = [EUserRole.ROLE_USER];

    return this.userManager.saveSingle(user);
  }

  public createUser(): Promise<User> {
    const user = new User();
    const email = this.faker.email();

    user.tz = 'UTC';
    user.email = email;
    user.emailOrPhone = email;
    user.roles = [EUserRole.ROLE_USER];
    user.passwordPlain = this.faker.validatedPassword();

    return this.userManager.saveSingle(user);
  }

  public createUserWithPhone(phone: string): Promise<User> {
    const user = new User();

    user.tz = 'UTC';
    user.emailOrPhone = phone;
    user.phone = phone;
    user.roles = [EUserRole.ROLE_USER];
    user.passwordPlain = faker.datatype.uuid();

    return this.userManager.saveSingle(user);
  }

  public validatedPassword(): string {
    return `${faker.internet.password(10).toLowerCase()}${faker.random
      .alpha({ count: 2 })
      .toUpperCase()}_!${faker.datatype.number(9)}`;
  }
}
