import {Container} from 'inversify';

import {IConfigParameters} from '../interface/IConfigParameters';

import {Http} from '../service/Http';
import {OpenApi} from '../service/OpenApi';
import {Signer} from '../service/Signer';
import {RedisClient} from '../service/RedisClient';
import {UserFixture} from '../test/fixture/UserFixture';
import {UserRepository} from '../repository/UserRepository';
import {Filter} from '../service/Filter';
import {UserManager} from '../service/UserManager';
import {Mailer} from '../service/Mailer';
import {Faker} from '../service/Faker';
import {Authenticator} from '../service/Authenticator';
import {ActivityRepository} from '../repository/ActivityRepository';
import {ActivityFixture} from '../test/fixture/ActivityFixture';
import {ActivityManager} from '../service/ActivityManager';
import {ApplicationFixture} from '../test/fixture/ApplicationFixture';
import {TimeFixture} from '../test/fixture/TimeFixture';
import {PaymentFixture} from '../test/fixture/PaymentFixture ';
import {ApplicationRepository} from '../repository/ApplicationRepository';
import {TimeRepository} from '../repository/TimeRepository';
import {PaymentRepository} from '../repository/PaymentRepository';
import {ApplicationManager} from '../service/ApplicationManager';
import {TimeManager} from '../service/TimeManager';
import {PaymentManager} from '../service/PaymentManager';

export class AppContainer {
  private static container: Container;

  public static getContainer(): Container {
    return AppContainer.container;
  }

  public static build(parameters: IConfigParameters, env: string) {
    if (AppContainer.container) {
      return AppContainer.getContainer();
    }

    const container = new Container({skipBaseClassChecks: true});

    container.bind<string>('env').toConstantValue(env);
    container.bind<IConfigParameters>('parameters').toConstantValue(parameters);
    container.bind<Http>('Http').to(Http);
    container.bind<OpenApi>('OpenApi').to(OpenApi);

    // Repositories
    container.bind<UserRepository>('UserRepository').to(UserRepository);
    container.bind<ActivityRepository>('ActivityRepository').to(ActivityRepository);
    container.bind<ApplicationRepository>('ApplicationRepository').to(ApplicationRepository);
    container.bind<TimeRepository>('TimeRepository').to(TimeRepository);
    container.bind<PaymentRepository>('PaymentRepository').to(PaymentRepository);

    // Services
    container.bind<Signer>('Signer').to(Signer);
    container.bind<Authenticator>('Authenticator').to(Authenticator);
    container.bind<RedisClient>('RedisClient').to(RedisClient);
    container.bind<Filter>('Filter').to(Filter);
    container.bind<UserManager>('UserManager').to(UserManager);
    container.bind<ApplicationManager>('ApplicationManager').to(ApplicationManager);
    container.bind<TimeManager>('TimeManager').to(TimeManager);
    container.bind<PaymentManager>('PaymentManager').to(PaymentManager);
    container.bind<Mailer>('Mailer').to(Mailer);
    container.bind<ActivityManager>('ActivityManager').to(ActivityManager);
    container.bind<Faker>('Faker').to(Faker);

    // Fixture
    container.bind<UserFixture>('UserFixture').to(UserFixture);
    container.bind<ActivityFixture>('ActivityFixture').to(ActivityFixture);
    container.bind<ApplicationFixture>('ApplicationFixture').to(ApplicationFixture);
    container.bind<PaymentFixture>('PaymentFixture').to(PaymentFixture);
    container.bind<TimeFixture>('TimeFixture').to(TimeFixture);

    AppContainer.container = container;

    return container;
  }
}
