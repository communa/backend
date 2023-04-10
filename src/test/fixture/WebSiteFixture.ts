import { inject, injectable } from 'inversify';

import { WebSite } from '../../entity/WebSite';
import { WebSiteRepository } from '../../repository/WebSiteRepository';

@injectable()
export class WebSiteFixture {
  @inject('WebSiteRepository')
  protected webSiteRepository: WebSiteRepository;

  public create(sitemap: string): Promise<WebSite> {
    const webSite = new WebSite();

    webSite.sitemap = sitemap;

    return this.webSiteRepository.saveSingle(webSite);
  }
}
