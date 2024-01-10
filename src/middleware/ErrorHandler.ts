import {ExpressErrorMiddlewareInterface, Middleware} from 'routing-controllers';
import express from 'express';

import * as Sentry from '@sentry/node';
import {ValidationError} from 'class-validator';

@Middleware({type: 'after'})
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(
    error: any,
    _request: express.Request,
    response: express.Response,
    _next: (err: any) => any
  ): void {
    console.log(error);
    const httpCode: number = error.httpCode || error.response?.status || 500;

    const responseError: {
      message: string;
      name: string;
      errors?: any[];
    } = {
      message: error.message || error.name,
      name: error.name || 'Error',
    };

    if (error.errors && error.errors.length > 0) {
      responseError.errors = error.errors;
    }

    if (error.violations && error.violations.length > 0) {
      responseError.errors = error.violations.map((e: ValidationError) => {
        return {
          value: e.value,
          property: e.property,
          constraints: e.constraints,
          children: e.children,
        };
      });
    }

    this.captureSentry(httpCode, error);

    response.status(httpCode);
    response.send(responseError);
  }

  private captureSentry(httpCode: number, error: any) {
    const isWarning = httpCode === 400 || httpCode === 401;

    if (isWarning) {
      Sentry.captureException(error, {level: Sentry.Severity.Warning});
    } else {
      Sentry.captureException(error, {level: Sentry.Severity.Error});
    }
  }
}
