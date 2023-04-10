import winston from 'winston';
import * as logglyWinston from 'winston-loggly-bulk';
import fs from 'fs';

import { inject } from 'inversify';
import { IConfigParameters } from '../interface/IConfigParameters';

export class WinstonClient {
  @inject('env')
  private env: string;
  @inject('parameters')
  private parameters: IConfigParameters;
  public client: winston.Logger;

  constructor() {
    this.init();
  }

  private init() {
    this.client = winston.createLogger({
      level: 'debug',
    });

    if (this.env === 'test') {
      this.client.add(
        new winston.transports.Stream({
          stream: fs.createWriteStream('/dev/null'),
        })
      );
    } else if (this.env === 'development') {
      this.client.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
            winston.format.printf(data => {
              const { timestamp, level, message, ...metadata } = data;

              return `${timestamp as string} [${level}]: ${message} ${metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : ''
                }`;
            }),
            winston.format.colorize({ all: true })
          ),
          handleExceptions: true,
        })
      );
    } else {
      this.client.add(
        new logglyWinston.Loggly({
          subdomain: this.parameters.loggly.subdomain,
          token: this.parameters.loggly.token,
          json: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(data => {
              const { timestamp, level, message } = data;

              return `${timestamp as string} [${level}]: ${message}`;
            })
          ),
          handleExceptions: true,
        })
      );
    }
  }
}
