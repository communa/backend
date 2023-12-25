import {AuthClientTypes} from '@walletconnect/auth-client';

export interface IConfigParameters {
  host: string;
  port: number;
  sentry: string;
  redis: string;
  jwtSecret: string;
  domain: string;
  homepage: string;
  walletConnect: AuthClientTypes.Options;
  database: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}
