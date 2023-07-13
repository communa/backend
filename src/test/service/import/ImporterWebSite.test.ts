import {skip, suite, test, timeout} from '@testdeck/mocha';

import {ImporterWebSite} from '../../../service/import/ImporterWebSite';
import {AbstractDatabaseIntegration} from '../../AbstractDatabase.integration';
import {WebSiteFixture} from '../../fixture/WebSiteFixture';

@suite()
export class ImporterWebSiteTest extends AbstractDatabaseIntegration {
  protected importerWebSite: ImporterWebSite;
  protected webSiteFixture: WebSiteFixture;

  constructor() {
    super();
    this.importerWebSite = this.container.get('ImporterWebSite');
    this.webSiteFixture = this.container.get('WebSiteFixture');
  }

  @test()
  @skip
  @timeout(20000)
  async processSitemap_cryptocurrencyjobs() {
    const sitemap = 'https://cryptocurrencyjobs.co/sitemap.xml';
    const webSite = await this.webSiteFixture.create(sitemap);

    await this.importerWebSite.processSitemap(webSite);
  }
}
