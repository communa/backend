import 'reflect-metadata';
import {join} from 'path';
import fs from 'fs';
import * as os from 'os';
import * as _ from 'lodash';
import {IConfigParameters} from '../interface/IConfigParameters';

export class AppConfig {
  public static readonly ENV = {
    test: ['test'],
    local: ['development'],
    production: ['production'],
  };

  public static getEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  public static isTest(): boolean {
    return AppConfig.ENV.test.indexOf(AppConfig.getEnv()) > -1;
  }

  public static isLocal(): boolean {
    return AppConfig.ENV.local.indexOf(AppConfig.getEnv()) > -1;
  }

  public static isProduction(): boolean {
    return AppConfig.ENV.production.indexOf(AppConfig.getEnv()) > -1;
  }

  public static readConfig(): IConfigParameters {
    const env = this.getEnv();

    const path = this.isProduction()
      ? `${os.homedir()}/parameters.production.json`
      : join(__dirname, `./../../parameters.${env}.json`);

    return JSON.parse(fs.readFileSync(path, 'utf8'));
  }
}
