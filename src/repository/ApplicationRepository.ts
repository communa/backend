import _ from 'lodash';
import {inject, injectable} from 'inversify';

import {Filter} from '../service/Filter';
import {AbstractRepositoryTemplate} from './AbstractRepositoryTemplate';
import {Application} from '../entity/Application';
import {ActivityRepository} from './ActivityRepository';
import {ISearchApplication} from '../interface/search/ISearchApplication';
import {User} from '../entity/User';
import {SelectQueryBuilder} from 'typeorm';

@injectable()
export class ApplicationRepository extends AbstractRepositoryTemplate<Application> {
  @inject('Filter')
  protected filter: Filter;
  protected target = Application;
  @inject('ActivityRepository')
  protected activityRepository: ActivityRepository;

  public async findAndCountBusiness(
    search: ISearchApplication,
    business: User
  ): Promise<[Application[], number]> {
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

    return this.getRepo()
      .createQueryBuilder('application')
      .innerJoin('application.activity', 'activity')
      .innerJoin('activity.user', 'activityUser')
      .andWhere('activityUser.id = :businessId', {businessId: business.id})
      .where((qb: SelectQueryBuilder<Application>) => {
        this.buildSearchQueries(qb, search);
      })
      .select()
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }

  public async findAndCountFreelancer(
    search: ISearchApplication,
    freelancer: User
  ): Promise<[Application[], number]> {
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

    return this.getRepo()
      .createQueryBuilder('application')
      .innerJoin('application.activity', 'activity')
      .innerJoin('application.user', 'applicationUser')
      .andWhere('applicationUser.id = :freelancerId', {freelancerId: freelancer.id})
      .where((qb: SelectQueryBuilder<Application>) => {
        this.buildSearchQueries(qb, search);
      })
      .select()
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }

  private buildSearchQueries(
    qb: SelectQueryBuilder<Application>,
    search: ISearchApplication
  ): SelectQueryBuilder<Application> {
    if ('activityId' in search.filter) {
      qb.andWhere('activity.id = :activityId', {activityId: search.filter.activityId});
    }

    return qb;
  }
}
