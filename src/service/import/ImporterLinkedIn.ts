import { inject, injectable } from 'inversify';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import {
  LinkedinScraper,
  events,
} from 'linkedin-jobs-scraper';

import { App } from '../../app/App';
import { PageReader } from './PageReader';
import { WebPageRepository } from '../../repository/WebPageRepository';
import { ActivityBuilder } from '../ActivityBuilder';
import { ArticleRenderer } from './ArticleRenderer';

@injectable()
export class ImporterLinkedIn {
  @inject('ActivityBuilder')
  protected activityBuilder: ActivityBuilder;
  @inject('ArticleRenderer')
  protected articleRenderer: ArticleRenderer;
  @inject('WebPageRepository')
  protected webPageRepository: WebPageRepository;
  @inject('PageReader')
  protected pageReader: PageReader;

  public async process(limit: number) {
    App.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        // '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    const scraper = new LinkedinScraper({
      headless: true,
      slowMo: 500,
    });

    scraper.on(events.scraper.data, async (data) => {
      const html = await this.articleRenderer.renderByUrl(data.link);
      const url = cheerio.load(html)('.rect-link-btn').attr('href');

      const $ = cheerio.load(data.descriptionHTML)('#job-details');

      if (url && url.indexOf('https://www.linkedin.com') !== 0) {

        data.applyLink = url;

        $.find('h2').remove();
        $.find('.artdeco-inline-feedback').remove();
        $.find('.text-heading-large').remove();

        data.descriptionHTML = $.html() as string;

        await this.activityBuilder.buildLinkedIn(data);
      }

    });

    await Promise.all([
      scraper.run({ query: "web3" }, { limit }),
      // scraper.run({ query: "blockchain" }, { limit }),
      // scraper.run({ query: "crypto" }, { limit }),
    ]);

    await scraper.close();

    await App.browser.close();
  }
}
