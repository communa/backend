import {User} from '@sentry/node';
import {injectable} from 'inversify';

import {ISearchMessage} from '../interface/search/ISearchMessage';

@injectable()
export class Messenger {
  public findByRoom(user: User, search: ISearchMessage) {
    console.log(user, search);

    return {};
  }
}
