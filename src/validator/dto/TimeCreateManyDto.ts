import {Type} from 'class-transformer';

import {IsArray, ValidateNested} from 'class-validator';
import {Time} from '../../entity/Time';

export class TimeCreateManyDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Time)
  time: Time[];
}
