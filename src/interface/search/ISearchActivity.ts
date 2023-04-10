import { ISearch } from './ISearch';

export interface ISearchActivity extends ISearch {
  filter: {
    userId?: string;
    locationId?: string;
    tagId?: string;
  };
}
