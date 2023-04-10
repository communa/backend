import { inject, injectable } from 'inversify';
import { WebSiteRepository } from '../repository/WebSiteRepository';
import { WebSite } from '../entity/WebSite';

@injectable()
export class WebsiteManager {
  @inject('WebSiteRepository')
  protected webSiteRepository: WebSiteRepository;

  public async findOrCreateBySitemap(sitemap: string): Promise<WebSite> {
    const webSiteExisting = await this.webSiteRepository.findOneBy({
      where: {
        sitemap
      },
    });

    if (webSiteExisting) {
      return webSiteExisting;
    }

    const webSite = new WebSite();
    webSite.sitemap = sitemap;

    return this.webSiteRepository.saveSingle(webSite);
  }
}
