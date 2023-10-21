import _ from 'lodash';
import {inject, injectable} from 'inversify';

import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {Time} from '../entity/Time';
import {ISearch} from '../interface/search/ISearch';

@injectable()
export class TimeRepository extends AbstractRepositoryTemplate<Time> {
  @inject('Filter')
  protected filter: Filter;
  protected target = Time;

  public async findAndCount(search: ISearch): Promise<[Time[], number]> {
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
    const sort = this.filter.buildOrderByCondition('time', s);
    const limit = this.filter.buildLimit(search);

    console.log(s.filter.keywords);

    return this.getRepo()
      .createQueryBuilder('time')
      .select()
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }
}
