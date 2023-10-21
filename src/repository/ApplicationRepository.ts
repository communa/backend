import _ from 'lodash';
import {inject, injectable} from 'inversify';

import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {Application} from '../entity/Application';
import {ISearch} from '../interface/search/ISearch';

@injectable()
export class ApplicationRepository extends AbstractRepositoryTemplate<Application> {
  @inject('Filter')
  protected filter: Filter;
  protected target = Application;

  public async findAndCount(search: ISearch): Promise<[Application[], number]> {
    const s = _.assign(
      {
        filter: {},
        sort: {
          createdAt: 'ASC',
        },
        page: 0,
      },
      search
    );
    const sort = this.filter.buildOrderByCondition('application', s);
    const limit = this.filter.buildLimit(search);

    console.log(s.filter.keywords);

    return this.getRepo()
      .createQueryBuilder('application')
      .select()
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }
}
