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
import { OpenAPI } from 'routing-controllers-openapi';

import { App } from '../app/App';
import { User } from '../entity/User';
import { Activity } from '../entity/Activity';
import { EntityFromParam } from '../decorator/EntityFromParam';
import { ExtendedResponseSchema } from '../decorator/ExtendedResponseSchema';
import { EUserRole } from '../interface/EUserRole';
import { AbstractController } from './AbstractController';
import { CurrentUser } from '../decorator/CurrentUser';
import { ActivityRepository } from '../repository/ActivityRepository';
import { ActivitySearchDto } from '../validator/dto/ActivitySearchDto';
import { ActivityManager } from '../service/ActivityManager';

@JsonController('/activity')
export class ActivityController extends AbstractController {
  protected activityManager: ActivityManager;
  protected activityRepository: ActivityRepository;

  constructor() {
    super();

    this.activityManager = App.container.get('ActivityManager');
    this.activityRepository = App.container.get('ActivityRepository');
  }

  @Post('/search')
  @ExtendedResponseSchema(Activity, { isPagination: true })
  @ResponseClassTransformOptions({ groups: ['search'] })
  public search(@Body() search: ActivitySearchDto) {
    return this.activityRepository.findAndCount(search);
  }

  @Post('/feed')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Activity, { isPagination: true })
  @ResponseClassTransformOptions({ groups: ['search'] })
  public feed(@Body() search: ActivitySearchDto, @CurrentUser() currentUser: User) {
    return this.activityRepository.feed(currentUser, search);
  }

  @Get('/:id')
  @ResponseClassTransformOptions({ groups: ['search'] })
  public get(@EntityFromParam('id') activity: Activity) {
    return activity;
  }

  @Put('/:id')
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(200)
  public edit(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') activity: Activity,
    @Body({ validate: { groups: ['edit'] }, transform: { groups: ['edit'] } }) data: Activity
  ) {
    if (currentUser.id !== activity.id) {
      throw new Error('Wrong user');
    }

    this.activityManager.editValidateAndSave(activity, data);

    return {};
  }

  @Delete('/:id')
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(200)
  public async delete(@CurrentUser() currentUser: User, @EntityFromParam('id') activity: Activity) {
    await this.activityRepository.delete({
      id: activity.id,
      user: currentUser,
    });

    return {};
  }

  @Post()
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(201)
  public async create(
    @CurrentUser() currentUser: User,
    @Body({ validate: { groups: ['create'] }, transform: { groups: ['create'] } }) data: Activity,
    @Res() res: any
  ) {
    data.user = currentUser;

    const activity = await this.activityManager.validateAndSave(data);

    res.status(201);
    res.location(`/api/activity/${activity.id}`);

    return {};
  }

  @Post('/import')
  @HttpCode(201)
  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          example: {
            url: 'https://www.sothebysrealty.com/extraordinary-living-blog/life-of-luxury-miami-beach-opens-a-doorway-of-discovery',
          },
        },
      },
      required: false,
    },
  })
  @Authorized([EUserRole.ROLE_USER])
  public async import(
    @CurrentUser() currentUser: User,
    @Body() payload: { url: string },
    @Res() res: any
  ) {
    const activity = await this.activityManager.import(currentUser, payload.url);

    res.status(201);
    res.location(`/api/activity/${activity.id}`);

    return {};
  }
}
