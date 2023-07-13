import {inject, injectable} from 'inversify';

import {WebPageRepository} from '../../repository/WebPageRepository';
import {WebPage} from '../../entity/WebPage';

@injectable()
export class WebPageFixture {
  @inject('WebPageRepository')
  protected webPageRepository: WebPageRepository;

  public create(url: string): Promise<WebPage> {
    const webPage = new WebPage();

    webPage.url = url;

    return this.webPageRepository.saveSingle(webPage);
  }
}
