import {Authorized, Delete, HttpCode, JsonController, Post} from 'routing-controllers';

import {App} from '../app/App';
import {User} from '../entity/User';
import {EUserRole} from '../interface/EUserRole';
import {AbstractController} from './AbstractController';
import {CurrentUser} from '../decorator/CurrentUser';
import {EntityFromParam} from '../decorator/EntityFromParam';
import {Tag} from '../entity/Tag';
import {TagRepository} from '../repository/TagRepository';

@Authorized([EUserRole.ROLE_USER])
@JsonController('/tag')
export class TagController extends AbstractController {
  protected tagRepository: TagRepository;

  constructor() {
    super();

    this.tagRepository = App.container.get('TagRepository');
  }

  @Post('/:id/follow')
  @HttpCode(200)
  public async follow(@CurrentUser() currentUser: User, @EntityFromParam('id') tag: Tag) {
    return this.tagRepository.follow(tag, currentUser);
  }

  @Delete('/:id/follow')
  @HttpCode(200)
  public async unFollow(@CurrentUser() currentUser: User, @EntityFromParam('id') tag: Tag) {
    return this.tagRepository.unFollow(tag, currentUser);
  }
}
