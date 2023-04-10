import {inject, injectable} from 'inversify';
import {User} from '../entity/User';

import {IAuthTokens} from '../interface/IAuthTokens';
import {Authenticator} from './Authenticator';
import {AuthenticatorSubstrate} from './AuthenticatorSubstrate';

@injectable()
export class AuthenticatorTest {
  @inject('AuthenticatorSubstrate')
  protected authenticatorSubstrate: AuthenticatorSubstrate;
  @inject('Authenticator')
  protected authenticator: Authenticator;

  public loginSubstrate(user: User): IAuthTokens {
    const tokens = this.authenticatorSubstrate.getTokens(user);

    return tokens;
  }

  public login(user: User): IAuthTokens {
    const tokens = this.authenticator.getTokens(user);

    return tokens;
  }
}
