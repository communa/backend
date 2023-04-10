import 'reflect-metadata';
import {join} from 'path';
import fs from 'fs';
import * as _ from 'lodash';
import {IConfigParameters} from '../interface/IConfigParameters';

export class AppConfig {
  public static readonly ENV = {
    test: ['test'],
    local: ['development'],
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

  public static readLocal(): IConfigParameters {
    const env = this.getEnv();
    const environment: IConfigParameters = JSON.parse(
      fs.readFileSync(join(__dirname, `./../../parameters.${env}.json`), 'utf8')
    );
    const global: IConfigParameters = JSON.parse(
      fs.readFileSync(join(__dirname, './../../parameters.json'), 'utf8')
    );

    return _.merge(global, environment);
  }
}
