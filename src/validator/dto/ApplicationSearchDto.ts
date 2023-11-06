import {IsObject} from 'class-validator';
import {SearchDto} from './SearchDto';

export class ApplicationSearchDto extends SearchDto {
  @IsObject()
  filter: {
    activityId: string;
  };
}
