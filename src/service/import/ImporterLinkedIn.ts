import {inject, injectable} from 'inversify';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import {LinkedinScraper, events, onSiteOrRemoteFilter} from 'linkedin-jobs-scraper';

import {App} from '../../app/App';
import {WebPageRepository} from '../../repository/WebPageRepository';
import {ActivityBuilder} from '../ActivityBuilder';
import {ArticleRenderer} from './ArticleRenderer';

@injectable()
export class ImporterLinkedIn {
  @inject('ActivityBuilder')
  protected activityBuilder: ActivityBuilder;
  @inject('ArticleRenderer')
  protected articleRenderer: ArticleRenderer;
  @inject('WebPageRepository')
  protected webPageRepository: WebPageRepository;

  public async process(keywords: string[], limit: number, authCookie: string) {
    App.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        // '--window-size=1920x1080',
      ],
    });

    for (let i = 0; i < keywords.length; i++) {
      await this.processKeyword(keywords[i], limit, authCookie);
    }

    await App.browser.close();
  }

  private async processKeyword(keyword: string, limit: number, authCookie: string) {
    const scraper = new LinkedinScraper({
      headless: true,
      slowMo: 300,
    });

    scraper.on(events.scraper.data, async data => {
      const cookies = [
        {
          name: 'li_at',
          value: authCookie,
          domain: '.www.linkedin.com',
        },
      ];
      const html = await this.articleRenderer.renderByUrl(data.link, cookies);
      const url = cheerio.load(html)('.rect-link-btn').attr('href');

      const $ = cheerio.load(data.descriptionHTML)('#job-details');
      $.find('h2').remove();
      $.find('.artdeco-inline-feedback').remove();
      $.find('.text-heading-large').remove();
      $.contents()
        .filter(function () {
          return this.type === 'comment';
        })
        .remove();

      const description = $.html()?.trim() as string;

      console.log(url);

      if (url && url.indexOf('https://www.linkedin.com') !== 0 && description) {
        data.applyLink = url;
        data.descriptionHTML = description;
        data.link = `https://www.linkedin.com/jobs/view/${data.jobId}`;

        await this.activityBuilder.buildLinkedIn(data, keyword);
      }
    });

    await scraper.run(
      {query: keyword},
      {
        limit,
        filters: {
          onSiteOrRemote: [onSiteOrRemoteFilter.REMOTE, onSiteOrRemoteFilter.HYBRID],
        },
      }
    );

    await scraper.close();
  }
}
