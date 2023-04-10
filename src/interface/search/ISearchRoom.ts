import {OrderByCondition} from 'typeorm';

import {ISearch} from './ISearch';

export interface ISearchRoom extends ISearch {
  sort: OrderByCondition;
  page: number;
  filter: {
    userId?: string;
    activityId?: string;
  };
  query?: string;
  limit?: number;
}
