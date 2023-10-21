import {
  Authorized,
  Body,
  HttpCode,
  JsonController,
  Post,
  Res,
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

@JsonController('/time')
export class TimeController extends AbstractController {
  protected timeManager: TimeManager;
  protected timeRepository: TimeRepository;

  constructor() {
    super();

    this.timeManager = App.container.get('TimeManager');
    this.timeRepository = App.container.get('TimeRepository');
  }

  @Post('/search')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Time, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public search(@Body() search: TimeSearchDto) {
    return this.timeRepository.findAndCount(search);
  }

  @Post()
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(201)
  public async create(
    @CurrentUser() currentUser: User,
    @Body({validate: {groups: ['create']}, transform: {groups: ['create']}}) data: Time,
    @Res() res: any
  ) {
    data.user = currentUser;

    const time = await this.timeManager.save(data);

    res.status(201);
    res.location(`/api/time/${time.id}`);

    return {};
  }
}
