import {
  Post,
  BodyParam,
  JsonController,
  Res,
  HttpCode,
  Get,
  Body,
  Req,
  ResponseClassTransformOptions,
} from 'routing-controllers';

import faker from 'faker';
import express from 'express';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';

import {User} from '../entity/User';
import {App} from '../app/App';
import {Authenticator} from '../service/Authenticator';
import {UserManager} from '../service/UserManager';
import {UserRepository} from '../repository/UserRepository';
import {IConfigParameters} from '../interface/IConfigParameters';
import {AuthForgotPasswordDto} from '../validator/dto/AuthDto';

@JsonController('/auth')
export class AuthController {
  protected authenticator: Authenticator;
  protected userManager: UserManager;
  protected userRepository: UserRepository;
  protected parameters: IConfigParameters;

  constructor() {
    this.userManager = App.container.get('UserManager');
    this.userRepository = App.container.get('UserRepository');
    this.authenticator = App.container.get('Authenticator');
    this.parameters = App.container.get('parameters');
  }

  @OpenAPI({
    summary: 'Auth login Web3',
    requestBody: {
      content: {
        'application/json': {
          examples: {},
        },
      },
      required: false,
    },
    responses: {
      200: {
        description: 'Replies with refresh and login headers sent',
        content: {
          'application/json': {},
        },
      },
    },
  })
  @Post('/web3')
  @HttpCode(200)
  public async loginWeb3(
    @Body()
    payload: {
      signature: string;
      address: string;
    },
    @Res() res: any
  ) {
    const tokens = await this.authenticator.loginWeb3(payload.signature, payload.address);

    res.setHeader('Authorization', tokens.accessToken);
    res.setHeader('Refresh-Token', tokens.refreshToken);

    return {};
  }

  @HttpCode(200)
  @Post('/nonce')
  @OpenAPI({
    summary: 'Nonce for user login',
    requestBody: {
      content: {
        'application/json': {
          examples: {},
        },
      },
      required: false,
    },
    responses: {
      200: {
        description: 'Replies with nonce for user login',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                nonce: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  public nonce(@Body() payload: {address: string}): Promise<string> {
    return this.authenticator.getNonce(payload.address);
  }

  @OpenAPI({
    summary: 'Register as a user',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            email: {
              emailOrPhone: faker.internet.email(),
              passwordPlain: faker.internet.password(),
            },
            phone: {
              emailOrPhone: faker.phone.phoneNumber(),
              passwordPlain: faker.internet.password(),
            },
          },
        },
      },
      required: false,
    },
  })
  @Post('/register')
  @HttpCode(201)
  public async register(
    @Body({validate: {groups: ['register']}, transform: {groups: ['register']}}) payload: User,
    @Res() res: any
  ) {
    const newUser = await this.authenticator.register(payload);
    const token = this.authenticator.generateJwtToken(newUser);

    res.setHeader('Authorization', token);
    res.location('/api/auth/status');

    return {};
  }

  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          examples: {
            email: {
              emailOrPhone: faker.internet.email(),
              password: faker.internet.password(),
            },
            phone: {
              emailOrPhone: faker.internet.email(),
              password: faker.internet.password(),
            },
          },
        },
      },
      required: false,
    },
  })
  @Post('/login')
  public async login(
    @BodyParam('emailOrPhone') emailOrPhone: string,
    @BodyParam('password') password: string,
    @Res() res: any
  ) {
    const user = await this.authenticator.login(emailOrPhone, password);
    const tokens = this.authenticator.getTokens(user);

    res.setHeader('Authorization', tokens.accessToken);
    res.setHeader('Refresh-Token', tokens.refreshToken);
    res.location(`/api/user/${user.id}`);

    return res.send();
  }

  @Post('/refresh')
  @OpenAPI({
    responses: {
      200: {
        description: 'Returns succesfully updated access and refresh tokens in headers',
        headers: {
          Authorization: {
            required: true,
            schema: {
              type: 'string',
            },
            description: 'contains JWT Access Token',
          },
          'Refresh-Token': {
            required: true,
            schema: {
              type: 'string',
            },
            description: 'contains JWT Refresh Token',
          },
        },
      },
    },
  })
  public async refresh(@BodyParam('refreshToken') refreshToken: string, @Res() res: any) {
    const user = await this.authenticator.getUserFromRefreshToken(refreshToken);
    const tokens = this.authenticator.getTokens(user);

    res.setHeader('Authorization', tokens.accessToken);
    res.setHeader('Refresh-Token', tokens.refreshToken);

    return res.send();
  }

  @Get('/status')
  @ResponseSchema(User)
  @ResponseClassTransformOptions({groups: ['search', 'me']})
  public async status(@Req() req: express.Request) {
    const token = req.headers.authorization as string;
    const user = await this.authenticator.getUserFromJwtToken(token);

    return user;
  }

  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          example: {
            emailOrPhone: faker.internet.email(),
          },
        },
      },
      required: false,
    },
  })
  @Post('/forgot-password')
  public async passwordReset(@Body() payload: AuthForgotPasswordDto) {
    await this.authenticator.forgotPassword(payload.emailOrPhone);

    return {};
  }
}
