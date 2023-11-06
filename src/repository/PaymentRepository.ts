import _ from 'lodash';
import {inject, injectable} from 'inversify';

import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {Payment} from '../entity/Payment';
import {ISearch} from '../interface/search/ISearch';
import {User} from '../entity/User';
import RejectedExecutionException from '../exception/RejectedExecutionException';

@injectable()
export class PaymentRepository extends AbstractRepositoryTemplate<Payment> {
  @inject('Filter')
  protected filter: Filter;
  protected target = Payment;

  public async findOneConfirmUser(payment: Payment, user: User): Promise<Payment> {
    const paymentBusiness = await this.getRepo()
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.activity', 'activity')
      .innerJoin('activity.user', 'business')
      .andWhere('payment.id = :paymentId', {paymentId: payment.id})
      .andWhere('business.id = :businessId', {businessId: user.id})
      .select()
      .getOne();

    const paymentFreelancer = await this.getRepo()
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.activity', 'activity')
      .innerJoin('activity.applicationAccepted', 'application')
      .innerJoin('application.user', 'freelancer')
      .andWhere('payment.id = :paymentId', {paymentId: payment.id})
      .andWhere('freelancer.id = :freelancerId', {freelancerId: user.id})
      .select()
      .getOne();

    const p = paymentFreelancer || paymentBusiness;

    if (!p) {
      throw new RejectedExecutionException('Wrong user');
    }

    return p;
  }

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

    return this.getRepo()
      .createQueryBuilder('payment')
      .select()
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }
}
