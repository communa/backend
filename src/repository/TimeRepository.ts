import _ from 'lodash';
import {inject, injectable} from 'inversify';

import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {Time} from '../entity/Time';
import {ISearch} from '../interface/search/ISearch';
import {User} from '../entity/User';
import RejectedExecutionException from '../exception/RejectedExecutionException';

@injectable()
export class TimeRepository extends AbstractRepositoryTemplate<Time> {
  @inject('Filter')
  protected filter: Filter;
  protected target = Time;

  public async findOneConfirmUser(time: Time, user: User): Promise<Time> {
    const timeBusiness = await this.getRepo()
      .createQueryBuilder('time')
      .innerJoinAndSelect('time.activity', 'activity')
      .innerJoin('activity.user', 'business')
      .andWhere('time.id = :timeId', {timeId: time.id})
      .andWhere('business.id = :businessId', {businessId: user.id})
      .select()
      .getOne();

    const timeFreelancer = await this.getRepo()
      .createQueryBuilder('time')
      .innerJoinAndSelect('time.activity', 'activity')
      .innerJoin('activity.applicationAccepted', 'application')
      .innerJoin('application.user', 'freelancer')
      .andWhere('time.id = :timeId', {timeId: time.id})
      .andWhere('freelancer.id = :freelancerId', {freelancerId: user.id})
      .select()
      .getOne();

    const t = timeFreelancer || timeBusiness;

    if (!t) {
      throw new RejectedExecutionException('Wrong user');
    }

    return t;
  }

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
