import {
  Authorized,
  Body,
  Get,
  JsonController,
  Post,
  ResponseClassTransformOptions,
} from 'routing-controllers';

import {App} from '../app/App';
import {User} from '../entity/User';
import {ExtendedResponseSchema} from '../decorator/ExtendedResponseSchema';
import {EUserRole} from '../interface/EUserRole';
import {AbstractController} from './AbstractController';
import {CurrentUser} from '../decorator/CurrentUser';
import {TimeManager} from '../service/TimeManager';
import {TimeRepository} from '../repository/TimeRepository';
import {TimeSearchDto} from '../validator/dto/TimeSearchDto';
import {Time} from '../entity/Time';
import {EntityFromParam} from '../decorator/EntityFromParam';

@JsonController('/time')
export class TimeController extends AbstractController {
  protected timeManager: TimeManager;
  protected timeRepository: TimeRepository;

  constructor() {
    super();

    this.timeManager = App.container.get('TimeManager');
    this.timeRepository = App.container.get('TimeRepository');
  }

  @Post('/search/freelancer')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Time, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchFreelancer(@Body() search: TimeSearchDto) {
    return this.timeRepository.findAndCount(search);
  }

  @Post('/search/freelancer')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Time, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchBusiness(@Body() search: TimeSearchDto) {
    return this.timeRepository.findAndCount(search);
  }

  @Get('/:id')
  @ResponseClassTransformOptions({groups: ['search']})
  public get(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id', null, {activity: true}) time: Time
  ) {
    return this.timeRepository.findOneConfirmUser(time, currentUser);
  }
}
