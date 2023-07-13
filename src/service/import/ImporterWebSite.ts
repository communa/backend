import {inject, injectable} from 'inversify';

import {WebSite} from '../../entity/WebSite';

import {ActivityRepository} from '../../repository/ActivityRepository';
import {WebPageRepository} from '../../repository/WebPageRepository';
import {Http} from '../Http';
import {Parser} from 'xml2js';
import {WebPage} from '../../entity/WebPage';

@injectable()
export class ImporterWebSite {
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;
  @inject('WebPageRepository')
  protected webPageRepository: WebPageRepository;
  @inject('Http')
  protected http: Http;

  public async processSitemap(website: WebSite) {
    const response = await this.http.request({
      url: website.sitemap,
    });
    const urls = await this.convertToJson(response.data);

    for (let i = 0; i < urls.length; i++) {
      const webPage = await this.webPageRepository.findOneByUrl(urls[i]);

      if (!webPage) {
        const webPage = new WebPage();
        webPage.url = urls[i];
        webPage.website = website;
        await this.webPageRepository.saveSingle(webPage);
      }
    }
  }

  private convertToJson(xml: string): Promise<string[]> {
    const parser = new Parser();

    return new Promise(resolve => {
      let collection: string[] = [];
      parser.parseString(xml, (_err, result) => {
        const json: any = JSON.parse(JSON.stringify(result, null, 4));

        collection = json.urlset.url.map((u: any) => {
          return u.loc[0];
        });
      });

      return resolve(collection);
    });
  }
}
