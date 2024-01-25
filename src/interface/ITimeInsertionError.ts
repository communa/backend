export interface ITimeInsertionError {
  index: number;
  activityId: string;
  fromAt: number;
  toAt: number;
  name: string;
  message: string;
  errors?: any;
}
