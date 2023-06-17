import { Post, Req, Body, Get, JsonController, HttpCode, Res } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import express from 'express';

import { App } from '../app/App';
import { AuthenticatorWeb3 } from '../service/AuthenticatorWeb3';
import { IUser } from '../interface/IUser';

@JsonController('/auth/web3')
export class AuthWeb3Controller {
  protected authenticator: AuthenticatorWeb3;

  constructor() {
    this.authenticator = App.container.get('AuthenticatorWeb3');
  }

  @OpenAPI({
    summary: 'Auth login',
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
  @Post('/login')
  @HttpCode(200)
  public async login(
    @Body()
    payload: {
      signature: string;
      address: string;
    },
    @Res() res: any
  ) {
    const tokens = await this.authenticator.login(payload.signature, payload.address);

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
  public nonce(@Body() payload: { address: string }): Promise<string> {
    return this.authenticator.getNonce(payload.address);
  }

  @HttpCode(200)
  @Get('/status')
  @OpenAPI({
    summary: 'User object or null returned depedning to the authentication status',
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
        description: 'Authenticated user',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  public async status(@Req() req: express.Request): Promise<IUser | null> {
    const token = req.headers.authorization as string;
    const user = await this.authenticator.getUserFromJwtToken(token);

    return user;
  }
}
