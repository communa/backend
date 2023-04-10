import { inject, injectable } from 'inversify';

import { PageReader } from './PageReader';
import { Activity } from '../../entity/Activity';
import { WebPage } from '../../entity/WebPage';
import { WebPageRepository } from '../../repository/WebPageRepository';
import { ActivityBuilder } from '../ActivityBuilder';
import { App } from '../../app/App';
import puppeteer from 'puppeteer';

@injectable()
export class ImporterWebPage {
  @inject('ActivityBuilder')
  protected activityBuilder: ActivityBuilder;
  @inject('WebPageRepository')
  protected webPageRepository: WebPageRepository;
  @inject('PageReader')
  protected pageReader: PageReader;

  public async process(limit: number) {
    const webpages = await this.webPageRepository.findUnprocessed(limit);
    const c = 300;

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

    if (webpages[1] < limit) {
      limit = webpages[1];
    }

    for (let i = 0; i < limit; i = i + c) {
      console.log(i);
      const p = [];
      for (let x = 0; x < c; x++) {
        p.push(this.processUrl(webpages[0][i + x]));
      }
      await Promise.all(p);
    }

    if (App.browser) {
      await App.browser.close();
    }
  }

  public async processUrl(webPage: WebPage): Promise<Activity | null> {
    try {
      const page = await this.pageReader.renderAndRead(webPage.url);
      const activity = await this.activityBuilder.build(page);

      webPage.processedAt = new Date();
      webPage.error = null;
      await this.webPageRepository.saveSingle(webPage);

      return activity;
    } catch (e: any) {
      console.log('An error happened during processing ----> ', e);
      webPage.processedAt = new Date();
      webPage.error = e.toString();
      await this.webPageRepository.saveSingle(webPage);

      return null;
    }
  }
}
