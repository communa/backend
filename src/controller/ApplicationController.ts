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
import {ApplicationManager} from '../service/ApplicationManager';
import {ApplicationRepository} from '../repository/ApplicationRepository';
import {Application} from '../entity/Application';
import {ApplicationSearchDto} from '../validator/dto/ApplicationSearchDto';

@JsonController('/applicaton')
export class ApplicationController extends AbstractController {
  protected applicationManager: ApplicationManager;
  protected applicatonRepository: ApplicationRepository;

  constructor() {
    super();

    this.applicationManager = App.container.get('ApplicationManager');
    this.applicatonRepository = App.container.get('ApplicatonRepository');
  }

  @Post('/search')
  @Authorized([EUserRole.ROLE_USER])
  @ExtendedResponseSchema(Application, {isPagination: true})
  @ResponseClassTransformOptions({groups: ['search']})
  public search(@Body() search: ApplicationSearchDto) {
    return this.applicatonRepository.findAndCount(search);
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
}
