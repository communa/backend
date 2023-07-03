import * as _ from 'lodash';
import { inject, injectable } from 'inversify';
import { SelectQueryBuilder } from 'typeorm';

import { Filter } from '../service/Filter';
import { AbstractRepositoryTemplate } from './AbstractRepositoryTemplate';
import { Activity } from '../entity/Activity';
import { ISearchActivity } from '../interface/search/ISearchActivity';
import { User } from '../entity/User';

@injectable()
export class ActivityRepository extends AbstractRepositoryTemplate<Activity> {
  @inject('Filter')
  protected filter: Filter;
  protected target = Activity;

  public findOneByUrl(url: string): Promise<Activity | undefined> {
    return this.getRepo().findOne({
      where: {
        sourceUrl: url,
      }
    })
  }

  public async validateAndCreate(activity: Activity): Promise<Activity> {
    return this.getRepo().save(activity);
  }

  public async findAndCount(search: ISearchActivity): Promise<[Activity[], number]> {
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
    const sort = this.filter.buildOrderByCondition('activity', s);
    const limit = this.filter.buildLimit(search);

    return this.getRepo()
      .createQueryBuilder('activity')
      .select()
      .where((qb: SelectQueryBuilder<Activity>) => {
        this.buildSearchQueries(qb, search);
      })
      .andWhere('activity.cancelledAt IS NULL')
      .andWhere('activity.jobUrl IS NOT NULL')
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }

  public async findAndCountPublishing(search: ISearchActivity, user: User): Promise<[Activity[], number]> {
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
    const sort = this.filter.buildOrderByCondition('activity', s);
    const limit = this.filter.buildLimit(search);

    return this.getRepo()
      .createQueryBuilder('activity')
      .select()
      .where((qb: SelectQueryBuilder<Activity>) => {
        qb.andWhere('activity.user.id = :userId', { userId: user.id });
      })
      .orderBy(sort)
      .skip(limit * s.page)
      .take(limit)
      .getManyAndCount();
  }

  private buildSearchQueries(
    qb: SelectQueryBuilder<Activity>,
    search: ISearchActivity
  ): SelectQueryBuilder<Activity> {
    if ('userId' in search.filter) {
      qb.andWhere('activity.user.id = :userId', { userId: search.filter.userId });
    }

    return qb;
  }
}
