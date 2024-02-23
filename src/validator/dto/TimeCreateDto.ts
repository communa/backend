import {IsNumber, IsString} from 'class-validator';

export class TimeCreateDto {
  @IsNumber()
  fromAt: number;
  @IsNumber()
  toAt: number;
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
