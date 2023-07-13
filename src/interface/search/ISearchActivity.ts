import {EActivityState} from '../EActivityState';
import {ISearch} from './ISearch';

export interface ISearchActivity extends ISearch {
  filter: {
    userId?: string;
    state?: EActivityState;
  };
}
