import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import fs from 'fs';
import {join} from 'path';

import {AppConfig} from '../../../app/AppConfig';
import {AppContainer} from '../../../app/AppContainer';
import {PageReader} from '../../../service/import/PageReader';

@suite()
export class PageReaderTest {
  protected pageReader: PageReader;

  constructor() {
    const env = AppConfig.getEnv();
    const parameters = AppConfig.readLocal();
    const container = AppContainer.build(parameters, env);

    this.pageReader = container.get('PageReader');
  }

  @test()
  async read() {
    const url =
      'https://www.sothebysrealty.com/extraordinary-living-blog/life-of-luxury-miami-beach-opens-a-doorway-of-discovery';
    const html = fs.readFileSync(
      join(
        __dirname,
        '../../fixture/sothebys/life-of-luxury-miami-beach-opens-a-doorway-of-discovery'
      )
    );

    const data = await this.pageReader.read(html.toString(), url);

    expect(data.url).to.be.equal(
      'https://www.sothebysrealty.com/extraordinary-living-blog/life-of-luxury-miami-beach-opens-a-doorway-of-discovery'
    );
    expect(data.text.html.length).to.be.equal(9538);
    expect(data.error).to.be.equal('');
  }
}
