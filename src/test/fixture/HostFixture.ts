import { inject, injectable } from 'inversify';

import { UserFixture } from './UserFixture';
import { Faker } from '../../service/Faker';
import { EUserRole } from '../../interface/EUserRole';
import { User } from '../../entity/User';
import { Signer } from '../../service/Signer';
import { UserManager } from '../../service/UserManager';

@injectable()
export class HostFixture extends UserFixture {
  @inject('Faker')
  protected faker: Faker;
  @inject('Signer')
  protected signer: Signer;
  @inject('UserManager')
  protected userManager: UserManager;

  public createHost(tz: string = 'UTC'): Promise<User> {
    const user = new User();
    const keypair = this.signer.generateKeyPair();
    const email = this.faker.email();

    user.address = keypair.address;
    user.tz = tz;
    user.email = email;
    user.emailOrPhone = email;
    user.roles = [EUserRole.ROLE_USER, EUserRole.ROLE_HOST];


    return this.userManager.saveSingle(user);
  }

  public createHostFullSchedule(tz: string = 'UTC'): Promise<User> {
    const user = new User();
    const keypair = this.signer.generateKeyPair();
    const email = this.faker.email();

    user.address = keypair.address;
    user.tz = tz;
    user.email = email;
    user.emailOrPhone = email;
    user.roles = [EUserRole.ROLE_USER, EUserRole.ROLE_HOST];

    return this.userManager.saveSingle(user);
  }

  public async newHostMondayFriday(tz: string = 'UTC'): Promise<User> {
    const user = new User();
    const keypair = this.signer.generateKeyPair();

    user.address = keypair.address;
    user.tz = tz;
    user.roles = [EUserRole.ROLE_USER, EUserRole.ROLE_HOST];

    return this.userManager.saveSingle(user);
  }
}
