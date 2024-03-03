import {TimeCreateDto} from '../validator/dto/TimeCreateDto';

export interface ITimeInsertionResult extends TimeCreateDto {
  error?: {
    name: string;
    message: string;
    errors?: any;
  };
}
