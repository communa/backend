import nock from 'nock';
import {Container} from 'inversify';
import {timeout} from '@testdeck/mocha';

import {App} from '../../app/App';
import {AppConfig} from '../../app/AppConfig';
import {AppContainer} from '../../app/AppContainer';
import {createAppTest} from '../../app/AppBootstrap';
import {IConfigParameters} from '../../interface/IConfigParameters';
import {Http} from '../../service/Http';
import {Faker} from '../../service/Faker';

import {UserFixture} from '../fixture/UserFixture';
import {ActivityFixture} from '../fixture/ActivityFixture';
import {ApplicationRepository} from '../../repository/ApplicationRepository';
import {ApplicationFixture} from '../fixture/ApplicationFixture';
import {PaymentFixture} from '../fixture/PaymentFixture ';
import {TimeFixture} from '../fixture/TimeFixture';
import {Authenticator} from '../../service/Authenticator';

export class BaseControllerTest {
  protected url: string;
  protected app: App;
  protected container: Container;
  protected parameters: IConfigParameters;
  protected http: Http;
  protected faker: Faker;
  protected authenticator: Authenticator;

  protected activityFixture: ActivityFixture;
  protected paymentFixture: PaymentFixture;
  protected timeFixture: TimeFixture;
  protected applicationFixture: ApplicationFixture;
  protected applicationRepository: ApplicationRepository;
  protected userFixture: UserFixture;

  constructor() {
    const env = AppConfig.getEnv();
    const parameters = AppConfig.readLocal();

    this.container = AppContainer.build(parameters, env);
    this.parameters = this.container.get('parameters');
    this.http = this.container.get('Http');
    this.faker = this.container.get('Faker');

    this.authenticator = this.container.get('Authenticator');

    this.userFixture = this.container.get('UserFixture');
    this.activityFixture = this.container.get('ActivityFixture');
    this.timeFixture = this.container.get('TimeFixture');
    this.applicationFixture = this.container.get('ApplicationFixture');
    this.paymentFixture = this.container.get('PaymentFixture');

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
