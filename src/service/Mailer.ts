import {inject, injectable} from 'inversify';
import 'reflect-metadata';

import {User} from '../entity/User';
import {IConfigParameters} from '../interface/IConfigParameters';

@injectable()
export class Mailer {
  @inject('env')
  protected env: string;
  @inject('parameters')
  protected parameters: IConfigParameters;

  public sendUserNewEmail(_user: User): void {}

  public sendUserResetPasswordEmail(_user: User, _token: string): void {}
}
