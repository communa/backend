import {Container} from 'inversify';

import {IConfigParameters} from '../interface/IConfigParameters';

import {Http} from '../service/Http';
import {OpenApi} from '../service/OpenApi';
import {PageReader} from '../service/import/PageReader';

import {ArticleRenderer} from '../service/import/ArticleRenderer';
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
import {ImporterWebPage} from '../service/import/ImporterWebPage';
import {ImporterWebSite} from '../service/import/ImporterWebSite';
import {WebPageFixture} from '../test/fixture/WebPageFixture';
import {WebSiteFixture} from '../test/fixture/WebSiteFixture';
import {WebPageRepository} from '../repository/WebPageRepository';
import {WebSiteRepository} from '../repository/WebSiteRepository';
import {ActivityBuilder} from '../service/ActivityBuilder';
import {WebsiteManager} from '../service/WebsiteManager';

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
    container.bind<WebPageRepository>('WebPageRepository').to(WebPageRepository);
    container.bind<WebSiteRepository>('WebSiteRepository').to(WebSiteRepository);

    // Services
    container.bind<Signer>('Signer').to(Signer);
    container.bind<Authenticator>('Authenticator').to(Authenticator);
    container.bind<ActivityBuilder>('ActivityBuilder').to(ActivityBuilder);
    container.bind<PageReader>('PageReader').to(PageReader);
    container.bind<ArticleRenderer>('ArticleRenderer').to(ArticleRenderer);
    container.bind<RedisClient>('RedisClient').to(RedisClient);
    container.bind<Filter>('Filter').to(Filter);
    container.bind<UserManager>('UserManager').to(UserManager);
    container.bind<WebsiteManager>('WebsiteManager').to(WebsiteManager);

    container.bind<Mailer>('Mailer').to(Mailer);
    container.bind<ActivityManager>('ActivityManager').to(ActivityManager);
    container.bind<ImporterWebPage>('ImporterWebPage').to(ImporterWebPage);
    container.bind<ImporterWebSite>('ImporterWebSite').to(ImporterWebSite);
    container.bind<WebPageFixture>('WebPageFixture').to(WebPageFixture);
    container.bind<WebSiteFixture>('WebSiteFixture').to(WebSiteFixture);

    container.bind<Faker>('Faker').to(Faker);

    // Fixture
    container.bind<UserFixture>('UserFixture').to(UserFixture);
    container.bind<ActivityFixture>('ActivityFixture').to(ActivityFixture);

    AppContainer.container = container;

    return container;
  }
}
