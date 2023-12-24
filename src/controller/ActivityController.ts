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

@JsonController('/activity')
export class ActivityController extends AbstractController {
  protected activityManager: ActivityManager;
  protected activityRepository: ActivityRepository;

  constructor() {
    super();

    this.activityManager = App.container.get('ActivityManager');
    this.activityRepository = App.container.get('ActivityRepository');
  }

  @Get('/:id')
  @ResponseClassTransformOptions({groups: ['search']})
  public get(@EntityFromParam('id') activity: Activity) {
    return activity;
  }

  @Post('/search')
  @ExtendedResponseSchema(Activity, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public search(@Body() search: ActivitySearchDto) {
    return this.activityRepository.findAndCount(search);
  }

  @Post('/search/freelancer')
  @ExtendedResponseSchema(Activity, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchFreelancer(@CurrentUser() currentUser: User, @Body() search: ActivitySearchDto) {
    return this.activityRepository.findAndCountFreelancer(
      search,
      currentUser
    );
  }

  @Post('/search/publishing')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Activity, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchPublishing(@CurrentUser() currentUser: User, @Body() search: ActivitySearchDto) {
    return this.activityRepository.findAndCountPublishing(search, currentUser);
  }

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

  @Delete('/:id')
  @HttpCode(200)
  public async delete(@CurrentUser() currentUser: User, @EntityFromParam('id') activity: Activity) {
    await this.activityRepository.delete({
      id: activity.id,
      user: currentUser,
    });

    return {};
  }

  @Post()
  @HttpCode(201)
  @Authorized([EUserRole.ROLE_USER])
  public async create(
    @CurrentUser() currentUser: User,
    @Body({validate: {groups: ['create']}, transform: {groups: ['create']}}) data: Activity,
    @Res() res: any
  ) {
    data.user = currentUser;
    data.type = EActivityType.INPUT;

    const activity = await this.activityManager.save(data);

    res.status(201);
    res.location(`/api/activity/${activity.id}`);

    return {};
  }
}
