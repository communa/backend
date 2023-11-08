import _ from 'lodash';
import {inject, injectable} from 'inversify';

import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {Time} from '../entity/Time';
import {ISearch} from '../interface/search/ISearch';
import {User} from '../entity/User';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {Activity} from '../entity/Activity';

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

  public findTimeByFreelancerOrFail(time: Time, freelancer: User): Promise<Time> {
    return this.getRepo()
      .createQueryBuilder('time')
      .innerJoinAndSelect('time.activity', 'activity')
      .innerJoinAndSelect('activity.applicationAccepted', 'applicationAccepted')
      .innerJoinAndSelect('applicationAccepted.user', 'freelancer')
      .andWhere('freelancer.id = :freelancerId', {freelancerId: freelancer.id})
      .andWhere('time.id = :timeId', {timeId: time.id})
      .select()
      .getOneOrFail();
  }

  public findTimeBetweenForActivity(from: number, to: number, activity: Activity, freelancer: User): Promise<Time[]> {
    return this.getRepo()
      .createQueryBuilder('time')
      .innerJoinAndSelect('time.activity', 'activity')
      .innerJoinAndSelect('activity.applicationAccepted', 'applicationAccepted')
      .innerJoinAndSelect('applicationAccepted.user', 'freelancer')
      .andWhere('time.fromAt >= :from', {from})
      .andWhere('time.toAt =< :to', {to})
      .andWhere('freelancer.id = :freelancerId', {freelancerId: freelancer.id})
      .andWhere('activity.id = :activityId', {activityId: activity.id})
      .select()
      .getMany();
  }
}
