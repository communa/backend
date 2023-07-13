import {injectable} from 'inversify';

import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {WebSite} from '../entity/WebSite';

@injectable()
export class WebSiteRepository extends AbstractRepositoryTemplate<WebSite> {
  protected target = WebSite;

  public findOneBySitemap(sitemap: string): Promise<WebSite | undefined> {
    return this.getRepo().findOne({
      where: {
        sitemap,
      },
    });
  }
}
