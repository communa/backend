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
import {ApplicationManager} from '../service/ApplicationManager';
import {ApplicationRepository} from '../repository/ApplicationRepository';
import {Application} from '../entity/Application';
import {ApplicationSearchDto} from '../validator/dto/ApplicationSearchDto';
import {EntityFromParam} from '../decorator/EntityFromParam';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {ActivityRepository} from '../repository/ActivityRepository';

@JsonController('/application')
export class ApplicationController extends AbstractController {
  protected applicationManager: ApplicationManager;
  protected applicationRepository: ApplicationRepository;
  protected activityRepository: ActivityRepository;

  constructor() {
    super();

    this.applicationManager = App.container.get('ApplicationManager');
    this.applicationRepository = App.container.get('ApplicationRepository');
    this.activityRepository = App.container.get('ActivityRepository');
  }

  @Get('/:id')
  @ResponseClassTransformOptions({groups: ['search']})
  public get(@CurrentUser() currentUser: User, @EntityFromParam('id') application: Application) {
    if (currentUser.id !== application.user.id) {
      throw new RejectedExecutionException('Wrong user');
    }

    return application;
  }

  @Post('/search/business')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Application, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public searchBusiness(@CurrentUser() currentUser: User, @Body() search: ApplicationSearchDto) {
    return this.applicationRepository.findAndCountBusiness(search, currentUser);
  }

  @Post('/search/freelancer')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Application, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public search(@CurrentUser() currentUser: User, @Body() search: ApplicationSearchDto) {
    return this.applicationRepository.findAndCountFreelancer(search, currentUser);
  }

  @Post()
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(201)
  public async create(
    @CurrentUser() currentUser: User,
    @Body({validate: {groups: ['create']}, transform: {groups: ['create']}}) data: Application,
    @Res() res: any
  ) {
    data.user = currentUser;

    const application = await this.applicationManager.save(data);

    res.status(201);
    res.location(`/api/application/${application.id}`);

    return {};
  }

  @Put('/:id')
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(200)
  public async edit(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') application: Application,
    @Body({validate: {groups: ['edit']}, transform: {groups: ['edit']}}) data: Application
  ) {
    if (currentUser.id !== application.user.id) {
      throw new RejectedExecutionException('Wrong user');
    }

    await this.applicationManager.editAndSave(application, data);

    return {};
  }

  @Delete('/:id')
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(200)
  public async delete(
    @CurrentUser() currentUser: User,
    @EntityFromParam('id') application: Application
  ) {
    await this.applicationRepository.delete({
      id: application.id,
      user: currentUser,
    });

    return {};
  }
}
