import {Post, JsonController, HttpCode, Get, Req, Authorized, Param} from 'routing-controllers';

import express from 'express';
import {OpenAPI} from 'routing-controllers-openapi';

import {CurrentUser} from '../decorator/CurrentUser';
import {User} from '../entity/User';
import {App} from '../app/App';
import {EUserRole} from '../interface/EUserRole';
import {AuthenticatorTimeTracker} from '../service/AuthenticatorTimeTracker';

@JsonController('/auth/timeTracker')
export class AuthTimeTrackerController {
  protected authenticatorTimeTracker: AuthenticatorTimeTracker;

  constructor() {
    this.authenticatorTimeTracker = App.container.get('AuthenticatorTimeTracker');
  }

  @OpenAPI({
    summary: 'Generates nonce and initialises authentication process',
  })
  @HttpCode(200)
  @Post('/nonce')
  public async timeTrackerNonceGenerate(@Req() req: express.Request) {
    return await this.authenticatorTimeTracker.timeTrackerNonceGenerate(req.ip);
  }

  @OpenAPI({
    summary: 'Login operation by the timetracker to be pickedup by the frontend',
  })
  @HttpCode(200)
  @Post('/:nonce/login')
  public async timeTrackerLogin(@Param('nonce') nonce: string, @Req() req: express.Request) {
    await this.authenticatorTimeTracker.timeTrackerLogin(nonce, req.ip);

    return {};
  }

  @OpenAPI({
    summary: 'Authenicates and connects timetracker application by nonce',
  })
  @Authorized([EUserRole.ROLE_USER])
  @HttpCode(200)
  @Post('/:nonce/connect')
  public async timeTrackerConnect(
    @CurrentUser() currentUser: User,
    @Param('nonce') nonce: string,
    @Req() req: express.Request
  ) {
    await this.authenticatorTimeTracker.timeTrackerConnect(nonce, currentUser, req.ip);

    return {};
  }

  @OpenAPI({
    summary: 'Returns authentication state by nonce',
  })
  // @Authorized([EUserRole.ROLE_USER])
  @HttpCode(200)
  @Get('/:nonce')
  public async timeTrackerNonceGet(@Param('nonce') nonce: string, @Req() req: express.Request) {
    return this.authenticatorTimeTracker.timeTrackerNonceGet(nonce, req.ip);
  }
}
