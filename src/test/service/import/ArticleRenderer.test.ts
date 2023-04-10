import { skip, suite, test, timeout } from '@testdeck/mocha';
import { ArticleRenderer } from '../../../service/import/ArticleRenderer';
import { AppConfig } from '../../../app/AppConfig';
import { AppContainer } from '../../../app/AppContainer';

@suite()
export class ArticleRendererTest {
  protected articleRenderer: ArticleRenderer;

  constructor() {
    const env = AppConfig.getEnv();
    const parameters = AppConfig.readLocal();
    const container = AppContainer.build(parameters, env);

    this.articleRenderer = container.get('ArticleRenderer');
  }

  @test()
  @skip
  @timeout(20000)
  async read_cryptocurrencyjobs_jet() {
    const url = 'https://cryptocurrencyjobs.co/engineering/jet-protocol-data-engineer/';

    const data = await this.articleRenderer.renderByUrl(url);

    console.log(data);
  }

  @test()
  @skip
  @timeout(20000)
  async read_cryptocurrencyjobs_chainflip() {
    const url = 'https://cryptocurrencyjobs.co/engineering/chainflip-senior-rust-engineer/';

    const data = await this.articleRenderer.renderByUrl(url);

    console.log(data);
  }

  @test()
  @skip
  @timeout(20000)
  async read_cryptocurrencyjobs_ledger() {
    const url = 'https://cryptocurrencyjobs.co/operations/ledger-tax-specialist-intern/';

    const data = await this.articleRenderer.renderByUrl(url);

    console.log(data);
  }
}
