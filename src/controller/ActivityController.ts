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
import {Activity} from '../entity/Activity';
import {EntityFromParam} from '../decorator/EntityFromParam';
import {ExtendedResponseSchema} from '../decorator/ExtendedResponseSchema';
import {EUserRole} from '../interface/EUserRole';
import {AbstractController} from './AbstractController';
import {CurrentUser} from '../decorator/CurrentUser';
import {ActivityRepository} from '../repository/ActivityRepository';
import {ActivitySearchDto} from '../validator/dto/ActivitySearchDto';
import {ActivityManager} from '../service/ActivityManager';
import {EActivityType} from '../interface/EActivityType';
import {Application} from '../entity/Application';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {OpenAPI} from 'routing-controllers-openapi';

@JsonController('/activity')
export class ActivityController extends AbstractController {
  protected activityManager: ActivityManager;
  protected activityRepository: ActivityRepository;

  constructor() {
    super();

    this.activityManager = App.container.get('ActivityManager');
    this.activityRepository = App.container.get('ActivityRepository');
  }

  @OpenAPI({
    summary: 'Personal project or Hourly Contract get',
  })
  @Get('/:id')
  @ResponseClassTransformOptions({groups: ['search']})
  public get(@EntityFromParam('id') activity: Activity) {
    return activity;
  }

  @OpenAPI({
    summary: 'Job search to display open jobs for hire',
  })
  @Post('/search')
  @ExtendedResponseSchema(Activity, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public search(@Body() search: ActivitySearchDto) {
    return this.activityRepository.findAndCount(search);
  }

  @OpenAPI({
    summary: 'Personal project or Hourly Contract search used by freelancers',
  })
  @Post('/search/freelancer')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Activity, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchFreelancer(@CurrentUser() currentUser: User, @Body() search: ActivitySearchDto) {
    return this.activityRepository.findAndCountFreelancer(search, currentUser);
  }

  @OpenAPI({
    summary: 'Personal project or Hourly Contract search used by clients'
  })
  @Post('/search/business')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Activity, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchBusiness(@CurrentUser() currentUser: User, @Body() search: ActivitySearchDto) {
    return this.activityRepository.findAndCountBusiness(
      search,
      currentUser
    );
  }

  @OpenAPI({
    summary: 'Assign given application submitted by a freelancer'
  })
  @Post('/:id/accept/:applicationId')
  @Authorized([EUserRole.ROLE_USER])
  @ResponseClassTransformOptions({groups: ['search']})
  public async acceptApplication(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') activity: Activity,
    @EntityFromParam('applicationId') application: Application
  ) {
    if (currentUser.id !== activity.user.id) {
      throw new RejectedExecutionException('Wrong user');
    }

    await this.activityManager.acceptApplication(activity, application);

    return {};
  }

  @OpenAPI({
    summary: 'Close hourly contract'
  })
  @Post('/:id/close')
  @Authorized([EUserRole.ROLE_USER])
  @ResponseClassTransformOptions({groups: ['search']})
  public async close(@EntityFromParam('id') activity: Activity, @CurrentUser() currentUser: User) {
    if (currentUser.id !== activity.user.id) {
      throw new RejectedExecutionException('Wrong user');
    }

    await this.activityManager.close(activity);

    return {};
  }

  @OpenAPI({
    summary: 'Hourly contract edit'
  })
  @Put('/:id')
  @HttpCode(200)
  @Authorized([EUserRole.ROLE_USER])
  public async edit(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') activity: Activity,
    @Body({validate: {groups: ['edit']}, transform: {groups: ['edit']}}) data: Activity
  ) {
    if (currentUser.id !== activity.user.id) {
      throw new RejectedExecutionException('Wrong user');
    }

    await this.activityManager.editAndSave(activity, data);

    return {};
  }

  @OpenAPI({
    summary: 'Personal project or Hourly contract remove'
  })
  @Delete('/:id')
  @HttpCode(200)
  public async delete(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') activity: Activity
  ) {
    await this.activityRepository.delete({
      id: activity.id,
      user: currentUser,
    });

    return {};
  }

  @OpenAPI({
    summary: 'Personal project or Hourly contract create'
  })
  @Post()
  @HttpCode(201)
  @Authorized([EUserRole.ROLE_USER])
  public async create(
    @CurrentUser() currentUser: User,
    @Body({validate: {groups: ['create']}, transform: {groups: ['create']}}) data: Activity,
    @Res() res: any
  ) {
    data.user = currentUser;

    const isValidType = [EActivityType.CONTRACT, EActivityType.PERSONAL].includes(data.type);

    if (!isValidType) {
      throw new Error(`The wrong type ${data.type} provided`);
    }

    const activity = await this.activityManager.save(data);

    res.status(201);
    res.location(`/api/activity/${activity.id}`);

    return {};
  }
}
