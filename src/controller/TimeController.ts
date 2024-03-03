import {
  Authorized,
  Body,
  Delete,
  Get,
  HttpCode,
  JsonController,
  Post,
  Put,
  QueryParam,
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
import {OpenAPI} from 'routing-controllers-openapi';
import {ITimeInsertionResult} from '../interface/ITimeInsertionResult';
import {TimeCreateDto} from '../validator/dto/TimeCreateDto';
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
    summary: 'Time totals',
  })
  @Get('/totals')
  @ResponseClassTransformOptions({groups: ['search']})
  public getTotals(
    @CurrentUser() currentUser: User,
    @QueryParam('activityId') activityId?: string
  ) {
    return this.timeRepository.getTotals(currentUser, activityId);
  }

  @OpenAPI({
    summary: 'Report for activity',
  })
  @Get('/report/:id')
  @ResponseClassTransformOptions({groups: ['search']})
  public async getReport(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') activity: Activity
  ) {
    return await this.timeManager.buildAndCacheReport(activity, currentUser);
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
    summary: 'Create multiple time records from array',
    requestBody: {
      content: {
        'application/json': {
          example: {
            fromIndex: 1000,
            toIndex: 1001,
            note: '9b0f61cb-9ca5-41ac-bf0c-91f94b797d02',
            keyboardKeys: 3,
            minutesActive: 4,
            mouseKeys: 3,
            mouseDistance: 5,
            fromAt: '2024-01-21T09:28:00.000Z',
            toAt: '2024-01-21T09:38:00.000Z',
            activityId: 'dd8a088d-00c1-499f-a75b-7ca45821a7e3',
          },
          schema: {
            properties: {},
          },
        },
      },
      required: false,
    },
    responses: {
      200: {
        description: 'Echoes data passed with error property added in case of an error',
        content: {
          'application/json': [
            {
              fromIndex: 1000,
              toIndex: 1001,
              fromAt: '2024-03-15T10:54:35.945Z',
              toAt: '2024-03-15T11:04:35.945Z',
              note: 'ce266129-7d74-4acb-98cf-7c8c6a3e2321',
              activityId: '44c72b8c-9e06-4ddf-84ab-8ee6d1066861',
              error: {
                message:
                  'null value in column "keyboardKeys" of relation "time" violates not-null constraint',
                name: 'QueryFailedError',
              },
            },
          ],
        },
      },
    },
  })
  @Post()
  @HttpCode(200)
  public createMany(
    @CurrentUser() currentUser: User,
    @Body({
      validate: {
        groups: ['create'],
      },
      transform: {groups: ['create']},
    })
    data: TimeCreateDto[]
  ): Promise<ITimeInsertionResult[]> {
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
