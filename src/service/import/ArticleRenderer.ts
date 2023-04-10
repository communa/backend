import { injectable } from 'inversify';
import * as puppeteer from 'puppeteer';
import { App } from '../../app/App';

@injectable()
export class ArticleRenderer {
  private blockedResourceTypes = [
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset',
  ];
  private skippedResources = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'cdn.api.twitter',
    'google-analytics',
    'googletagmanager',
    'google',
    'fontawesome',
    'facebook',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn',
  ];

  public renderByUrl(url: string): Promise<string> {
    return (async () => {
      // console.log(App.browser);
      // if (!App.browser) {
      //   App.browser = await puppeteer.launch({
      //     args: [
      //       '--no-sandbox',
      //       '--disable-setuid-sandbox',
      //       '--disable-dev-shm-usage',
      //       // '--disable-accelerated-2d-canvas',
      //       '--disable-gpu',
      //       '--window-size=1920x1080',
      //     ],
      //   });
      // }
      const page = await App.browser.newPage();

      page.on('request', (request: puppeteer.HTTPRequest) => {
        const requestUrl = request.url().split('?')[0].split('#')[0];

        if (
          this.blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
          this.skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
        ) {
          void request.abort();
        } else {
          void request.continue();
        }
      });

      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13A404 Safari/601.1'
      );
      await page.setRequestInterception(true);
      await page.setViewport({
        width: 1600,
        height: 900,
      });
      await page.goto(url, {
        // waitUntil: 'domcontentloaded'
        waitUntil: 'networkidle2',
        timeout: 25000,
      });

      await this.scrollToBottom(page);

      const html = await page.content();
      await page.close();

      return html;
    })();
  }

  private async scrollToBottom(page: puppeteer.Page): Promise<void> {
    await page.evaluate(async () => {
      return await new Promise(resolve => {
        const distance = 500;
        const scrollHeight = document.body.scrollHeight - distance * 2;
        let totalHeight = 0;

        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve(totalHeight);
          }
        }, 300);
      });
    });
  }
}
