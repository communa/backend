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
import {OpenAPI} from 'routing-controllers-openapi';
import {ITimeInsertionError} from '../interface/ITimeInsertionError';

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

  @OpenAPI({
    summary: 'Time search',
  })
  @Post('/search')
  @ExtendedResponseSchema(Time, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchFreelancer(@Body() search: TimeSearchDto, @CurrentUser() currentUser: User) {
    return this.timeRepository.findAndCountPersonal(search, currentUser);
  }

  @OpenAPI({
    summary: 'Single time read',
    responses: {
      200: {
        description: 'Empty object',
        content: {
          'application/json': {},
        },
      },
    },
  })
  @Get('/:id')
  @ResponseClassTransformOptions({groups: ['search']})
  public get(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id', null, {activity: true}) time: Time
  ) {
    return this.timeRepository.findOneConfirmUser(time, currentUser);
  }

  @OpenAPI({
    summary: 'Create single time record',
    responses: {
      201: {
        description: 'Empty object',
        content: {
          'application/json': {},
        },
      },
    },
  })
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

  @OpenAPI({
    summary: 'Create multiple time records from array',
    responses: {
      201: {
        description: 'Empty object',
        content: {
          'application/json': {},
        },
      },
    },
  })
  @Post('/activity')
  @HttpCode(200)
  public createMany(
    @CurrentUser() currentUser: User,
    // todo: implement dtop to validate input valus as array
    @Body({
      validate: {
        groups: ['create'],
      },
      transform: {groups: ['create']},
    })
    data: Time[]
  ): Promise<ITimeInsertionError[]> {
    return this.timeManager.saveMany(data, currentUser);
  }

  @OpenAPI({
    summary: 'Edit sumbitted time interval',
    responses: {
      204: {
        description: 'Empty object',
        content: {
          'application/json': {},
        },
      },
    },
  })
  @Put('/:id')
  @HttpCode(204)
  public async edit(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') time: Time,
    @Body({validate: {groups: ['edit']}, transform: {groups: ['edit']}}) data: Time
  ) {
    await this.timeManager.editAndSave(time, data, currentUser);

    return {};
  }

  @OpenAPI({
    summary: 'Remove time',
    responses: {
      200: {
        description: 'Empty object',
        content: {
          'application/json': {},
        },
      },
    },
  })
  @Delete('/:id')
  @HttpCode(200)
  public async delete(@CurrentUser() currentUser: User, @EntityFromParam('id') time: Time) {
    await this.timeManager.remove(time, currentUser);

    return {};
  }
}
