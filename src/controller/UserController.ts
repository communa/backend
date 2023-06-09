import {
  Authorized,
  Body,
  Get,
  HttpCode,
  JsonController,
  Param,
  Post,
  Put,
  ResponseClassTransformOptions,
} from 'routing-controllers';
import faker from 'faker';
import { OpenAPI } from 'routing-controllers-openapi';

import { App } from '../app/App';
import { User } from '../entity/User';
import { EUserRole } from '../interface/EUserRole';
import { UserManager } from '../service/UserManager';
import { AbstractController } from './AbstractController';
import { CurrentUser } from '../decorator/CurrentUser';
import { UserRepository } from '../repository/UserRepository';
import { ISearchUser } from '../interface/search/ISearchUser';

@JsonController('/user')
export class UserController extends AbstractController {
  protected userManager: UserManager;
  protected userRepository: UserRepository;

  constructor() {
    super();

    this.userManager = App.container.get('UserManager');
    this.userRepository = App.container.get('UserRepository');
  }
  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          example: {
            filter: {
              storeName: 'H&M',
            },
          },
        },
      },
      required: false,
    },
  })
  @Post('/search')
  @ResponseClassTransformOptions({ groups: ['search'] })
  public search(@Body() search: ISearchUser) {
    return this.userRepository.findAndCount(search);
  }

  @Get('/:address/address')
  @ResponseClassTransformOptions({ groups: ['search'] })
  public get(@Param('address') address: string,): Promise<User> {
    return this.userRepository.findByAddressPublicOrFail(address);
  }

  @Put()
  @HttpCode(204)
  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          example: {
            bio: faker.datatype.number(),
            passwordPlain: faker.datatype.uuid(),
            passwordOld: faker.datatype.uuid(),
            roles: [EUserRole.ROLE_USER, EUserRole.ROLE_BUSINESS],
            tz: 'America/Los_Angeles',
            phone: faker.phone.phoneNumber(),
          },
          schema: {
            properties: {
              bio: {
                type: 'number',
              },
              passwordPlain: {
                type: 'string',
              },
              passwordOld: {
                type: 'string',
                description: 'should be equal to the current password',
              },
              tz: {
                type: 'string',
              },
              phone: {
                type: 'number',
              },
            },
          },
        },
      },
      required: false,
    },
  })
  @Authorized([EUserRole.ROLE_USER])
  public async edit(
    @CurrentUser() currentUser: User,
    @Body({ validate: { groups: ['edit'] }, transform: { groups: ['edit'] } }) data: User
  ) {
    await this.userManager.editValidateAndSave(currentUser, data);
    return {};
  }
}
