import _ from 'lodash';
import {inject, injectable} from 'inversify';

import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {Payment} from '../entity/Payment';
import {ISearch} from '../interface/search/ISearch';

@injectable()
export class PaymentRepository extends AbstractRepositoryTemplate<Payment> {
  @inject('Filter')
  protected filter: Filter;
  protected target = Payment;

  public async findAndCount(search: ISearch): Promise<[Payment[], number]> {
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
    const sort = this.filter.buildOrderByCondition('payment', s);
    const limit = this.filter.buildLimit(search);

    console.log(s.filter.keywords);

    return this.getRepo()
      .createQueryBuilder('payment')
      .select()
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }
}
