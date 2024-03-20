import _ from 'lodash';
import {inject, injectable} from 'inversify';

import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {Time} from '../entity/Time';
import {ISearch} from '../interface/search/ISearch';
import {User} from '../entity/User';
import RejectedExecutionException from '../exception/RejectedExecutionException';
import {Activity} from '../entity/Activity';
import {EActivityType} from '../interface/EActivityType';
import {EActivityState} from '../interface/EActivityState';
import {SelectQueryBuilder} from 'typeorm';
import {ISearchTime} from '../interface/search/ISearchTime';
import {ITimeTotals} from '../interface/ITimeTotals';

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
      .innerJoin('activity.proposalAccepted', 'proposal')
      .innerJoin('proposal.user', 'freelancer')
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

  public async getTotals(user: User, activityId: string | undefined): Promise<ITimeTotals[]> {
    const result = await this.getRepo()
      .createQueryBuilder('time')
      .innerJoinAndSelect('time.activity', 'activity')
      .innerJoinAndSelect('activity.user', 'user')
      .andWhere('user.id = :userId', {userId: user.id})
      .select([
        'activity.id as activityId',
        'activity.rateHour as rateHour',
        'COUNT(time.id) as minutes',
        'SUM(time.minutesActive) as minutesActive',
        'SUM(time.keyboardKeys) as keyboardKeys',
        'SUM(time.mouseKeys) as mouseKeys',
        'SUM(time.mouseDistance) as mouseDistance',
      ])
      .where((qb: SelectQueryBuilder<Time>) => {
        qb.andWhere('activity.user.id = :userId', {userId: user.id});

        if (activityId) {
          qb.andWhere('activity.id = :activityId', {activityId});
        }
      })
      .groupBy('activity.id')
      .getRawMany();

    return result.map(r => {
      return {
        activityId: r.activityid,
        rateHour: r.ratehour,
        minutes: Number(r.minutes),
        minutesActive: Number(r.minutesactive),
        keyboardKeys: Number(r.keyboardkeys),
        mouseKeys: Number(r.mousekeys),
        mouseDistance: Number(r.mousedistance),
      };
    });
  }

  public findAndCountPersonal(search: ISearchTime, user: User): Promise<[Time[], number]> {
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

    return this.getRepo()
      .createQueryBuilder('time')
      .innerJoinAndSelect('time.activity', 'activity')
      .innerJoinAndSelect('activity.user', 'user')
      .andWhere('user.id = :userId', {userId: user.id})
      .andWhere(`activity.type = :type`, {type: EActivityType.PERSONAL})
      .andWhere(`activity.state = :state`, {state: EActivityState.PUBLISHED})
      .select()
      .where((qb: SelectQueryBuilder<Time>) => {
        qb.andWhere('activity.user.id = :userId', {userId: user.id});

        if ('activityId' in s.filter) {
          qb.andWhere('activity.id = :activityId', {activityId: s.filter.activityId});
        }
      })
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }

  public findAndCount(search: ISearch): Promise<[Time[], number]> {
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
      .innerJoinAndSelect('activity.proposalAccepted', 'proposalAccepted')
      .innerJoinAndSelect('proposalAccepted.user', 'freelancer')
      .andWhere('freelancer.id = :freelancerId', {freelancerId: freelancer.id})
      .andWhere('time.id = :timeId', {timeId: time.id})
      .select()
      .getOneOrFail();
  }

  public findAllTimeForActivity(activity: Activity, user: User): Promise<Time[]> {
    return this.getRepo()
      .createQueryBuilder('time')
      .innerJoinAndSelect('time.activity', 'activity')
      .innerJoinAndSelect('activity.user', 'user')
      .andWhere('activity.id = :activityId', {activityId: activity.id})
      .andWhere('user.id = :userId', {userId: user.id})
      .select('time')
      .orderBy('time.fromAt', 'DESC')
      .getMany();
  }

  public findTimeBetweenForActivity(
    from: number,
    to: number,
    activity: Activity,
    freelancer: User
  ): Promise<Time[]> {
    return this.getRepo()
      .createQueryBuilder('time')
      .innerJoinAndSelect('time.activity', 'activity')
      .innerJoinAndSelect('activity.proposalAccepted', 'proposalAccepted')
      .innerJoinAndSelect('proposalAccepted.user', 'freelancer')
      .andWhere('time.fromAt >= :from', {from})
      .andWhere('time.toAt =< :to', {to})
      .andWhere('freelancer.id = :freelancerId', {freelancerId: freelancer.id})
      .andWhere('activity.id = :activityId', {activityId: activity.id})
      .select()
      .getMany();
  }
}
