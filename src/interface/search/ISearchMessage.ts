import {OrderByCondition} from 'typeorm';

import {ISearch} from './ISearch';

export interface ISearchMessage extends ISearch {
  sort: OrderByCondition;
  page: number;
  filter: {
    roomId?: string;
  };
  query?: string;
  limit?: number;
}
