import moment from 'moment';
import {injectable} from 'inversify';

import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {WebPage} from '../entity/WebPage';

@injectable()
export class WebPageRepository extends AbstractRepositoryTemplate<WebPage> {
  protected target = WebPage;

  public findUnprocessed(limit: number): Promise<[WebPage[], number]> {
    const date = moment().subtract(24, 'hours').utc();
    return this.getRepo()
      .createQueryBuilder('w')
      .select()
      .where('w.processedAt < :time', {time: date.toDate()})
      .orWhere('w.processedAt IS NULL')
      .orderBy('w.processedAt', 'DESC')
      .take(limit)
      .getManyAndCount();
  }

  public findOneByUrl(url: string): Promise<WebPage | undefined> {
    return this.getRepo().findOne({
      where: {
        url,
      },
    });
  }
}
