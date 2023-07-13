import {suite, test} from '@testdeck/mocha';
import fs from 'fs';
import {join} from 'path';

import {AbstractDatabaseIntegration} from '../AbstractDatabase.integration';
import {ActivityBuilder} from '../../service/ActivityBuilder';
import {PageReader} from '../../service/import/PageReader';
import {expect} from 'chai';
import {Activity} from '../../entity/Activity';

@suite()
export class ActivityBuilderTest extends AbstractDatabaseIntegration {
  protected activityBuilder: ActivityBuilder;
  protected pageReader: PageReader;

  constructor() {
    super();

    this.pageReader = this.container.get('PageReader');
    this.activityBuilder = this.container.get('ActivityBuilder');
  }

  @test()
  async build_jet() {
    const url = 'https://cryptocurrencyjobs.co/engineering/jet-protocol-data-engineer/';
    const html = fs.readFileSync(join(__dirname, '../fixture/cryptocurrencyjobs/Data_Engineer'));

    const page = await this.pageReader.read(html.toString(), url);
    const activity = (await this.activityBuilder.build(page)) as Activity;

    expect(activity.title).to.be.eq('Data Engineer at Jet Protocol');
  }

  @test()
  async build_chainflip() {
    const url = 'https://cryptocurrencyjobs.co/engineering/chainflip-senior-rust-engineer/';
    const html = fs.readFileSync(
      join(__dirname, '../fixture/cryptocurrencyjobs/chainflip-senior-rust-engineer')
    );

    const page = await this.pageReader.read(html.toString(), url);
    const activity = (await this.activityBuilder.build(page)) as Activity;

    expect(activity.title).to.be.eq('Senior Rust Engineer at Chainflip');
  }

  @test()
  async build_ledger() {
    const url = 'https://cryptocurrencyjobs.co/operations/ledger-tax-specialist-intern/';
    const html = fs.readFileSync(
      join(__dirname, '../fixture/cryptocurrencyjobs/ledger-tax-specialist-intern')
    );

    const page = await this.pageReader.read(html.toString(), url);
    const activity = (await this.activityBuilder.build(page)) as Activity;

    expect(activity.title).to.be.eq('Tax Specialist Intern at Ledger');
  }
}
