import {
  Authorized,
  Body,
  Delete,
  Get,
  HttpCode,
  JsonController,
  Post,
  Put,
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
import {EntityFromParam} from '../decorator/EntityFromParam';
import {Activity} from '../entity/Activity';

@Authorized([EUserRole.ROLE_USER])
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
  @ExtendedResponseSchema(Time, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchFreelancer(@Body() search: TimeSearchDto) {
    return this.timeRepository.findAndCount(search);
  }

  @Post('/search/business')
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

  @Post('/activity/:activityId')
  @HttpCode(201)
  public async create(
    @CurrentUser() currentUser: User,
    @EntityFromParam('activityId') activity: Activity,
    @Body({validate: {groups: ['create']}, transform: {groups: ['create']}}) data: Time,
    @Res() res: any
  ) {
    const time = await this.timeManager.save(data, activity, currentUser);

    res.status(201);
    res.location(`/api/time/${time.id}`);

    return {};
  }

  @Put('/:id')
  @HttpCode(200)
  public async edit(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') time: Time,
    @Body({validate: {groups: ['edit']}, transform: {groups: ['edit']}}) data: Time
  ) {
    await this.timeManager.editAndSave(time, data, currentUser);

    return {};
  }

  @Delete('/:id')
  @HttpCode(200)
  public async delete(@CurrentUser() currentUser: User, @EntityFromParam('id') time: Time) {
    await this.timeManager.remove(time, currentUser);

    return {};
  }
}
