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
  Authorized,
  Param,
} from 'routing-controllers';

import express from 'express';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';

import {CurrentUser} from '../decorator/CurrentUser';
import {User} from '../entity/User';
import {App} from '../app/App';
import {Authenticator} from '../service/Authenticator';
import {UserManager} from '../service/UserManager';
import {UserRepository} from '../repository/UserRepository';
import {IConfigParameters} from '../interface/IConfigParameters';
import {EUserRole} from '../interface/EUserRole';

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

  @Authorized([EUserRole.ROLE_USER])
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

  @HttpCode(200)
  @Post('/timeTracker/nonce')
  public async timeTrackerNonceCreate(@Req() req: express.Request) {
    return await this.authenticator.timeTrackerNonceCreate(req.ip);
  }

  @OpenAPI({
    summary: 'Login operation by the timetracker',
  })
  @HttpCode(200)
  @Post('/timeTracker/:nonce/login')
  public async timeTrackerLogin(@Param('nonce') nonce: string, @Req() req: express.Request) {
    await this.authenticator.timeTrackerLogin(nonce, req.ip);

    return {};
  }

  @OpenAPI({
    summary: 'Used by the frontend to connect a wallet to the timetracker',
  })
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(200)
  @Post('/timeTracker/:nonce/connect')
  public async timeTrackerConnect(
    @CurrentUser() currentUser: User,
    @Param('nonce') nonce: string,
    @Req() req: express.Request
  ) {
    await this.authenticator.timeTrackerConnect(nonce, currentUser, req.ip);

    return {};
  }

  @OpenAPI({
    summary: 'Used by the frontend to connect a wallet to the timetracker',
  })
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(200)
  @Get('/timeTracker/:nonce')
  public async timeTrackerNonceGet(@Param('nonce') nonce: string, @Req() req: express.Request) {
    return this.authenticator.timeTrackerNonceGet(nonce, req.ip);
  }

  @OpenAPI({
    summary: 'User retrieval operation by the timetracker',
  })
  @HttpCode(200)
  @Get('/timeTracker/:nonce/jwt')
  public timeTrackerJwt(@Param('nonce') nonce: string, @Req() req: express.Request) {
    return this.authenticator.timeTrackerJwt(nonce, req.ip);
  }
}
