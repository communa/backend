import nock from 'nock';
import {Container} from 'inversify';
import {timeout} from '@testdeck/mocha';

import {App} from '../../app/App';
import {AppConfig} from '../../app/AppConfig';
import {AppContainer} from '../../app/AppContainer';
import {createAppTest} from '../../app/AppBootstrap';
import {IConfigParameters} from '../../interface/IConfigParameters';
import {Http} from '../../service/Http';
import {HostFixture} from '../fixture/HostFixture';
import {AuthenticatorTest} from '../../service/AuthenticatorTest';

export class BaseControllerTest {
  protected url: string;
  protected app: App;
  protected container: Container;
  protected parameters: IConfigParameters;
  protected http: Http;
  protected hostFixture: HostFixture;
  protected authenticatorTest: AuthenticatorTest;

  constructor() {
    const env = AppConfig.getEnv();
    const parameters = AppConfig.readLocal();

    this.container = AppContainer.build(parameters, env);
    this.parameters = this.container.get('parameters');
    this.http = this.container.get('Http');
    this.hostFixture = this.container.get('HostFixture');
    this.authenticatorTest = this.container.get('AuthenticatorTest');

    this.url = `http://${this.parameters.host}:${this.parameters.port}`;
  }

  @timeout(10000)
  async before() {
    this.app = createAppTest();
    await this.app.boostrap();
    this.app.start();
  }

  @timeout(10000)
  async after() {
    const pendedMocks = nock.pendingMocks();

    if (pendedMocks.length > 0) {
      console.log('There are pended mocks that should be removed');
      nock.cleanAll();
    }

    await this.app.stop();
  }
}
