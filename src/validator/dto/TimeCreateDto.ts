import {IsDateString, IsNumber, IsString} from 'class-validator';

export class TimeCreateDto {
  @IsNumber()
  fromIndex: number;
  @IsNumber()
  toIndex: number;
  @IsDateString()
  fromAt: string;
  @IsDateString()
  toAt: string;

  @IsString()
  activityId: string;

  @IsString()
  note: string | null;

  @IsNumber()
  minutesActive: number;
  @IsNumber()
  keyboardKeys: number;
  @IsNumber()
  mouseKeys: number;
  @IsNumber()
  mouseDistance: number;
}
