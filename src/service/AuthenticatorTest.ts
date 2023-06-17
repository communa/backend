import { inject, injectable } from 'inversify';
import { User } from '../entity/User';

import { IAuthTokens } from '../interface/IAuthTokens';
import { Authenticator } from './Authenticator';
import { AuthenticatorWeb3 } from './AuthenticatorWeb3';

@injectable()
export class AuthenticatorTest {
  @inject('AuthenticatorWeb3')
  protected authenticatorWeb3: AuthenticatorWeb3;
  @inject('Authenticator')
  protected authenticator: Authenticator;

  public loginSubstrate(user: User): IAuthTokens {
    const tokens = this.authenticatorWeb3.getTokens(user);

    return tokens;
  }

  public login(user: User): IAuthTokens {
    const tokens = this.authenticator.getTokens(user);

    return tokens;
  }
}
