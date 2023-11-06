import {ISearch} from './ISearch';

export interface ISearchApplication extends ISearch {
  filter: {
    activityId?: string;
  };
}
