import { Post, Req, Body, Get, JsonController, HttpCode, Res } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import express from 'express';

import { App } from '../app/App';
import { AuthenticatorSubstrate } from '../service/AuthenticatorSubstrate';
import { IUser } from '../interface/IUser';

@JsonController('/auth/substrate')
export class AuthSubstrateController {
  protected authenticator: AuthenticatorSubstrate;

  constructor() {
    this.authenticator = App.container.get('AuthenticatorSubstrate');
  }

  @OpenAPI({
    summary: 'Auth registration',
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
        description: 'Replies with address and mnemonic generated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  @Post('/register')
  @HttpCode(201)
  public async register(@Res() res: any) {
    const keypair = await this.authenticator.register();
    const user = this.authenticator.findUserByAddressOrFail(keypair.address);
    const tokens = this.authenticator.getTokens(user);

    res.setHeader('Authorization', tokens.accessToken);
    res.setHeader('Refresh-Token', tokens.refreshToken);

    return keypair;
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
