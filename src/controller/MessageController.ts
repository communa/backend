import {Authorized, Body, CurrentUser, JsonController, Post, Res} from 'routing-controllers';
import {App} from '../app/App';
import {User} from '../entity/User';
import {ISearchMessage} from '../interface/search/ISearchMessage';
import {Messenger} from '../service/Messenger';

import {EUserRole} from './../interface/EUserRole';
import {AbstractController} from './AbstractController';

@Authorized([EUserRole.ROLE_USER])
@JsonController('/message')
export class MessageController extends AbstractController {
  protected messenger: Messenger;

  constructor() {
    super();

    this.messenger = App.container.get('Messenger');
  }

  @Post('/search')
  public search(@CurrentUser() currentUser: User, @Body() search: ISearchMessage) {
    return this.messenger.findByRoom(currentUser, search);
  }

  @Post()
  public create(@Res() res: any) {
    res.status(201);
    res.location(`/api/message/${String(0)}`);

    return {};
  }

  @Post('/:id/read')
  public read(@Res() res: any) {
    res.status(200);

    return {};
  }
}
