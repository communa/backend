import { skip, suite, test, timeout } from '@testdeck/mocha';

import { ImporterWebPage } from '../../../service/import/ImporterWebPage';
import { WebPageFixture } from '../../fixture/WebPageFixture';
import { AbstractDatabaseIntegration } from '../../AbstractDatabase.integration';

@suite()
export class ImporterWebPageTest extends AbstractDatabaseIntegration {
  protected importerWebPage: ImporterWebPage;
  protected webPageFixture: WebPageFixture;

  constructor() {
    super();
    this.importerWebPage = this.container.get('ImporterWebPage');
    this.webPageFixture = this.container.get('WebPageFixture');
  }

  @test()
  @skip
  @timeout(20000)
  async read_cryptocurrencyjobs() {
    const u = 'https://cryptocurrencyjobs.co/engineering/jet-protocol-data-engineer/';
    const url = await this.webPageFixture.create(u);

    const activity = await this.importerWebPage.processUrl(url);

    console.log(activity);
  }
}
